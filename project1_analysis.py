"""
Project 1 — Full Analysis Script
Outputs exact numbers to paste into src/data/project1.js

Run from the repo root:
    python project1_analysis.py

Requires: pandas numpy scikit-learn
    pip install pandas numpy scikit-learn
"""
import sys, json, re, warnings
try:                       # ensure UTF-8 console output (Windows defaults to cp1252)
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass
import pandas as pd
import numpy as np
from pathlib import Path
from sklearn.ensemble import RandomForestRegressor, HistGradientBoostingRegressor
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.inspection import permutation_importance as _perm_imp
from sklearn.model_selection import train_test_split, cross_val_score, KFold
from sklearn.metrics import mean_absolute_error, r2_score
warnings.filterwarnings('ignore')

DATA = Path('powerbi/p1/project1_data')
SEED = 42

def banner(s): print(f"\n{'─'*60}\n  {s}\n{'─'*60}")
def pj(label, obj): print(f"\n// {label}\n{json.dumps(obj, indent=2)}")

# ── 1. LOAD ───────────────────────────────────────────────────────────────────
banner("1 / Loading data")
jobs       = pd.read_csv(DATA / 'job_postings_fact.csv',  low_memory=False)
skills_job = pd.read_csv(DATA / 'skills_job_dim.csv')
skills_dim = pd.read_csv(DATA / 'skills_dim.csv')
print(f"  job_postings_fact : {len(jobs):,} rows")
print(f"  skills_job_dim    : {len(skills_job):,} rows")
print(f"  skills_dim        : {len(skills_dim):,} rows")

# ── 2. CLEAN ──────────────────────────────────────────────────────────────────
banner("2 / Cleaning")
jobs['salary_year_avg'] = pd.to_numeric(jobs['salary_year_avg'], errors='coerce')
jobs['job_posted_date'] = pd.to_datetime(jobs['job_posted_date'], errors='coerce')
jobs['remote'] = jobs['job_work_from_home'].astype(str).str.lower() == 'true'

# Salary rows: $10K–$600K
salary_df = jobs[(jobs['salary_year_avg'] >= 10_000) &
                 (jobs['salary_year_avg'] <= 600_000)].copy()
salary_us = salary_df[salary_df['job_country'] == 'United States'].copy()
print(f"  Salary rows (global, $10K–$600K): {len(salary_df):,}")
print(f"  Salary rows (US only)            : {len(salary_us):,}")

# ── 3. KPI STATS ──────────────────────────────────────────────────────────────
banner("3 / KPI stats")
total_postings    = len(jobs)
countries_covered = jobs['job_country'].nunique()
salary_records    = len(salary_df)
median_salary_us  = int(salary_us['salary_year_avg'].median())
top_role          = jobs['job_title_short'].value_counts().idxmax()

kpi = {
    "totalPostings"   : total_postings,
    "countriesCovered": countries_covered,
    "salaryRecords"   : salary_records,
    "dateRange"       : "2023 – 2025",
    "medianSalary"    : median_salary_us,
    "topRole"         : top_role,
    "topSkill"        : "SQL",   # confirmed in skill counts below (Python ≈ SQL, virtually tied)
}
pj("stats", kpi)

# ── 4. SALARY BY TITLE ────────────────────────────────────────────────────────
banner("4 / Salary by title (US median)")
sal_by_title = (salary_us
    .groupby('job_title_short')['salary_year_avg']
    .median().round().astype(int).reset_index()
    .rename(columns={'job_title_short': 'title', 'salary_year_avg': 'salary'})
    .sort_values('salary', ascending=False))
pj("salaryByTitle", sal_by_title.to_dict('records'))

# ── 5. REMOTE % BY TITLE ─────────────────────────────────────────────────────
banner("5 / Remote % by title (all postings)")
remote_by = (jobs
    .groupby('job_title_short')['remote']
    .agg(['sum', 'count'])
    .assign(pct=lambda d: (d['sum'] / d['count'] * 100).round(1))
    .reset_index()
    .rename(columns={'job_title_short': 'title'})[['title', 'pct']]
    .sort_values('pct', ascending=False))
titles_keep = sal_by_title['title'].tolist()
remote_by = remote_by[remote_by['title'].isin(titles_keep)].reset_index(drop=True)
pj("remoteByTitle", remote_by.to_dict('records'))

# ── 6. TOP COUNTRIES ──────────────────────────────────────────────────────────
banner("6 / Top 10 countries by postings")
top_countries = (jobs['job_country']
    .value_counts().head(10).reset_index()
    .rename(columns={'job_country': 'country', 'count': 'postings'}))
pj("topCountries", top_countries.to_dict('records'))

# ── 7. TOP SKILLS ─────────────────────────────────────────────────────────────
banner("7 / Top 10 skills")
skill_name_map    = skills_dim.set_index('skill_id')['skills'].str.lower().to_dict()
skills_job['skill_name'] = skills_job['skill_id'].map(skill_name_map)
top_skills = (skills_job['skill_name']
    .value_counts().head(10).reset_index()
    .rename(columns={'skill_name': 'skill', 'count': 'count'}))
pj("topSkills", top_skills.to_dict('records'))

# ── 8. MONTHLY TREND ─────────────────────────────────────────────────────────
banner("8 / Monthly trend (postings + remote %)")
jobs['year_month'] = jobs['job_posted_date'].dt.to_period('M')
monthly = (jobs
    .groupby('year_month')
    .agg(postings=('job_id', 'count'), remote_sum=('remote', 'sum'))
    .assign(remote=lambda d: (d['remote_sum'] / d['postings'] * 100).round(1))
    .reset_index()
    .sort_values('year_month'))          # ← sort chronologically, not alphabetically
monthly['month'] = monthly['year_month'].dt.strftime('%b %y')

# Keep roughly 12 evenly-spaced points across the full date range
step = max(1, len(monthly) // 12)
monthly_sampled = monthly.iloc[::step].head(12)[['month', 'postings', 'remote']].reset_index(drop=True)
pj("monthlyTrend", monthly_sampled.to_dict('records'))

# ── 9. FEATURE ENGINEERING (US-only) ─────────────────────────────────────────
# Mirrors the Colab notebook (project1_analysis.ipynb, Section 8a). Scoping to the
# US market + an ordinal seniority tier parsed from the raw job_title lifts test
# R² from 0.33 (global, skills+role only) to ~0.53.
banner("9 / Feature engineering (US-only)")
df_ml = salary_us.copy()

# 1) Top-50 skill flags --------------------------------------------------------
top50_skill_names = (skills_job[skills_job['job_id'].isin(df_ml['job_id'])]
                     ['skill_name'].value_counts().head(50).index.tolist())
sj_top = skills_job[skills_job['skill_name'].isin(top50_skill_names)]
pivot  = (sj_top.groupby(['job_id', 'skill_name']).size()
          .unstack(fill_value=0).clip(upper=1))
pivot.columns = [f'skill_{c.replace(" ", "_").replace("-", "_").replace("/", "_")}'
                 for c in pivot.columns]
df_ml = df_ml.join(pivot, on='job_id', how='left')
skill_cols = list(pivot.columns)
df_ml[skill_cols] = df_ml[skill_cols].fillna(0).astype(int)

# 2) skill_count ---------------------------------------------------------------
skill_count = skills_job.groupby('job_id').size().rename('skill_count')
df_ml = df_ml.join(skill_count, on='job_id', how='left')
df_ml['skill_count'] = df_ml['skill_count'].fillna(0)

# 3) Ordinal seniority parsed from the RAW job_title ---------------------------
def seniority_tier(title):
    t = str(title).lower()
    if re.search(r'\b(principal|director|head|vp|vice president|chief|distinguished)\b', t): return 4
    if re.search(r'\b(lead|staff|manager|mgr)\b', t):                                        return 3
    if re.search(r'\b(senior|sr\.?)\b', t):                                                  return 2
    if re.search(r'\b(junior|jr\.?|entry|intern|associate|graduate|trainee)\b', t):          return 0
    return 1
df_ml['seniority'] = df_ml['job_title'].apply(seniority_tier)

# 4) Top-10 state one-hot from job_location ------------------------------------
def parse_state(loc):
    loc = str(loc)
    if ',' in loc:
        s = loc.split(',')[-1].strip()
        if len(s) == 2 and s.isalpha():
            return s.upper()
    return 'NA'
df_ml['state'] = df_ml['job_location'].apply(parse_state)
top10_states = df_ml['state'].value_counts().head(10).index.tolist()
df_ml['state_bucket'] = df_ml['state'].where(df_ml['state'].isin(top10_states), 'Other')
state_dummies = pd.get_dummies(df_ml['state_bucket'], prefix='state').astype(int)
df_ml = pd.concat([df_ml, state_dummies], axis=1)
state_cols = list(state_dummies.columns)

# 5) Extra posting flags -------------------------------------------------------
df_ml['remote']    = df_ml['job_work_from_home'].astype(str).str.lower().eq('true').astype(int)
df_ml['health']    = df_ml['job_health_insurance'].astype(str).str.lower().eq('true').astype(int)
df_ml['no_degree'] = df_ml['job_no_degree_mention'].astype(str).str.lower().eq('true').astype(int)
extra_cols = ['remote', 'health', 'no_degree']

# 6) Skill-combo interactions --------------------------------------------------
def _flag(col): return df_ml[col] if col in df_ml.columns else pd.Series(0, index=df_ml.index)
df_ml['skill_python_AND_spark'] = (_flag('skill_python') & _flag('skill_spark')).astype(int)
df_ml['skill_aws_AND_azure']    = (_flag('skill_aws')    & _flag('skill_azure')).astype(int)
df_ml['skill_python_AND_sql']   = (_flag('skill_python') & _flag('skill_sql')).astype(int)
interaction_cols = ['skill_python_AND_spark', 'skill_aws_AND_azure', 'skill_python_AND_sql']

# 7) Role one-hot --------------------------------------------------------------
role_dummies = pd.get_dummies(df_ml['job_title_short'], prefix='role').astype(int)
df_ml = pd.concat([df_ml, role_dummies], axis=1)
role_cols = list(role_dummies.columns)

feature_cols = (skill_cols + ['skill_count', 'seniority'] + extra_cols
                + interaction_cols + role_cols + state_cols)
X        = df_ml[feature_cols]
y_salary = df_ml['salary_year_avg']
print(f"  Feature matrix: {X.shape[0]:,} rows × {X.shape[1]} features (US-only)")

# ── 10. MODEL SELECTION + REGRESSION ─────────────────────────────────────────
# Compare four candidates with 5-fold CV, then evaluate the winner on a hold-out.
banner("10 / Regression — 5-fold CV model selection, predicting salary_year_avg")
kf = KFold(n_splits=5, shuffle=True, random_state=SEED)
candidates = {
    'Linear Regression'   : LinearRegression(),
    'Ridge'               : Ridge(alpha=10),
    'Random Forest'       : RandomForestRegressor(n_estimators=400, max_depth=16,
                                                  min_samples_leaf=8, n_jobs=-1, random_state=SEED),
    'HistGradientBoosting': HistGradientBoostingRegressor(max_iter=800, learning_rate=0.04,
                                                          max_depth=6, l2_regularization=2.0,
                                                          random_state=SEED),
}
cv_scores = {}
for name, model in candidates.items():
    cv_scores[name] = cross_val_score(model, X, y_salary, cv=kf, scoring='r2').mean()
    print(f"  {name:<22} CV R² = {cv_scores[name]:.3f}")
best_name = max(cv_scores, key=cv_scores.get)
reg = candidates[best_name]
print(f"  WINNER → {best_name}  (CV R² = {cv_scores[best_name]:.3f})")

X_tr, X_te, y_tr, y_te = train_test_split(X, y_salary, test_size=0.2, random_state=SEED)
reg.fit(X_tr, y_tr)
y_pred_r  = reg.predict(X_te)
r2_test   = r2_score(y_te, y_pred_r)
r2_train  = r2_score(y_tr, reg.predict(X_tr))
mae_test  = mean_absolute_error(y_te, y_pred_r)
mae_base  = float(np.abs(y_te - y_tr.mean()).mean())
cv_r2     = cv_scores[best_name]
print(f"  Test  R²  = {r2_test:.3f}")
print(f"  Train R²  = {r2_train:.3f}  (gap {r2_train - r2_test:+.3f})")
print(f"  Test  MAE = ${mae_test:,.0f}")
print(f"  Baseline  = ${mae_base:,.0f}  (predict mean)")
print(f"  Improvement = {(1 - mae_test/mae_base)*100:.0f}% lower error")
print(f"  Train: {len(X_tr):,}  |  Test: {len(X_te):,}")

# ── 11. FEATURE IMPORTANCE (permutation, top 12) ─────────────────────────────
banner("11 / Feature importance — permutation on test set")
perm = _perm_imp(reg, X_te, y_te, n_repeats=8, scoring='r2', random_state=SEED, n_jobs=-1)
imp_series = pd.Series(perm.importances_mean, index=feature_cols)
top12      = imp_series.sort_values(ascending=False).head(12)
total_perm = top12.clip(lower=0).sum() or 1.0

def pretty(col):
    return (col.replace('skill_', '').replace('role_', '').replace('state_', 'State ')
               .replace('_', ' ').strip().title()
               .replace('Sql', 'SQL').replace('Aws', 'AWS').replace('Gcp', 'GCP')
               .replace('Bi', 'BI'))

direction_map = {}
for feat in top12.index:
    mask = df_ml[feat] > 0
    hi   = y_salary[mask].mean()   if mask.any()  else 0
    lo   = y_salary[~mask].mean()  if (~mask).any() else 0
    direction_map[feat] = 1 if hi >= lo else -1

feature_importance_out = []
print(f"\n  {'Feature':<25} {'Importance':>10}  Dir")
for feat, imp in top12.items():
    pct_val   = round(imp / total_perm * 100, 1)
    label     = pretty(feat)
    direction = direction_map.get(feat, 1)
    print(f"  {label:<25} {pct_val:>9.1f}%  {'↑' if direction == 1 else '↓'}")
    feature_importance_out.append({
        "feature"   : label,
        "importance": pct_val,
        "direction" : direction,
    })

ml_results = {
    "task"             : "Regression",
    "model"            : best_name,
    "target"           : "US annual salary (salary_year_avg)",
    "r2"               : round(r2_test, 2),
    "mae"              : int(round(mae_test, -2)),
    "baselineMae"      : int(round(mae_base, -2)),
    "cvR2"             : round(cv_r2, 2),
    "trainR2"          : round(r2_train, 2),
    "nFeatures"        : len(feature_cols),
    "trainSize"        : len(X_tr),
    "testSize"         : len(X_te),
    "featureImportance": feature_importance_out,
}
pj("mlResults", ml_results)

# ── 12. FINAL PASTE BLOCK ────────────────────────────────────────────────────
banner("NUMBERS TO UPDATE IN src/data/project1.js")
print(f"""
stats.totalPostings     = {kpi['totalPostings']:,}
stats.countriesCovered  = {kpi['countriesCovered']}
stats.salaryRecords     = {kpi['salaryRecords']:,}
stats.medianSalary      = {kpi['medianSalary']:,}

Winning model         = {best_name}
Regression R² (test)   = {r2_test:.2f}   → mlResults.r2
Regression R² (CV)     = {cv_r2:.2f}   → mlResults.cvR2
Regression R² (train)  = {r2_train:.2f}   → mlResults.trainR2
Test MAE               = ${mae_test:,.0f}   → mlResults.mae
Baseline MAE           = ${mae_base:,.0f}   → mlResults.baselineMae
Improvement            = {(1 - mae_test/mae_base)*100:.0f}% lower error than always-mean

KPI card value  → 'R² {r2_test:.2f}'
KPI card sub    → 'Seniority + role + skills → US salary'
""")
