"""Project 1 role-comparison pipeline.
Reads powerbi/p1/project1_data/*.csv, writes comparison CSVs to
powerbi/p1/analysis/, prints the JS data block for src/data/project1_roles.js.
Run:  python -X utf8 project1_roles_pipeline.py
"""
import json
import pandas as pd

ROLES = ['Data Analyst', 'Business Analyst', 'Data Engineer', 'Data Scientist', 'Software Engineer']
SHORT = {'Data Analyst': 'DA', 'Business Analyst': 'BA', 'Data Engineer': 'DE',
         'Data Scientist': 'DS', 'Software Engineer': 'SE'}
DATA = 'powerbi/p1/project1_data'
OUT = 'powerbi/p1/analysis'
SAL_MIN, SAL_MAX = 10_000, 600_000

f = pd.read_csv(f'{DATA}/job_postings_fact.csv',
                usecols=['job_id', 'job_title_short', 'job_title', 'job_country',
                         'job_work_from_home', 'job_no_degree_mention',
                         'job_posted_date', 'salary_year_avg'])
f = f[f.job_title_short.isin(ROLES)].copy()

t = f.job_title.str.lower()
f['level'] = 'mid'
f.loc[t.str.contains(r'senior|sr[. ]|staff|principal|lead', regex=True, na=False), 'level'] = 'senior'
f.loc[t.str.contains(r'junior|jr[. ]|entry|intern|graduate|trainee', regex=True, na=False), 'level'] = 'junior'

s = f.dropna(subset=['salary_year_avg'])
s = s[(s.salary_year_avg >= SAL_MIN) & (s.salary_year_avg <= SAL_MAX)]

# ── role_salary: n, p25, median, p75 ──────────────────────────
g = s.groupby('job_title_short').salary_year_avg
role_salary = pd.DataFrame({
    'role': g.median().index,
    'n': g.size().values,
    'p25': g.quantile(.25).round(0).values,
    'median': g.median().round(0).values,
    'p75': g.quantile(.75).round(0).values,
}).set_index('role').loc[ROLES].reset_index()
role_salary.to_csv(f'{OUT}/role_salary.csv', index=False)

# ── role_trend: wide monthly postings per role ────────────────
f['month'] = pd.to_datetime(f.job_posted_date).dt.strftime('%Y-%m')
trend = f.groupby(['month', 'job_title_short']).size().unstack()[ROLES].reset_index()
trend.to_csv(f'{OUT}/role_trend.csv', index=False)

# ── role_barriers ─────────────────────────────────────────────
rows = []
sj = pd.read_csv(f'{DATA}/skills_job_dim.csv')
skills_per = sj.merge(f[['job_id', 'job_title_short']], on='job_id') \
               .groupby(['job_title_short', 'job_id']).size().groupby('job_title_short').median()
for r in ROLES:
    d, ds_ = f[f.job_title_short == r], s[s.job_title_short == r]
    mid = ds_[ds_.level == 'mid']
    med_nodeg = mid[mid.job_no_degree_mention].salary_year_avg.median()
    med_deg = mid[~mid.job_no_degree_mention].salary_year_avg.median()
    rows.append({'role': r,
                 'juniorPct': round((d.level == 'junior').mean() * 100, 1),
                 'noDegreePct': round(d.job_no_degree_mention.mean() * 100, 1),
                 'skillsPerPosting': float(skills_per[r]),
                 'degreePenaltyMid': round(med_nodeg - med_deg, 0),
                 'medNoDegreeMid': round(med_nodeg, 0),
                 'medDegreeMid': round(med_deg, 0)})
barriers = pd.DataFrame(rows)
barriers.to_csv(f'{OUT}/role_barriers.csv', index=False)

# ── role_overlap: Jaccard of top-15 skill sets ────────────────
sk = pd.read_csv(f'{DATA}/skills_dim.csv')
m = sj.merge(sk, on='skill_id').merge(f[['job_id', 'job_title_short']], on='job_id')
top = {r: set(m[m.job_title_short == r].skills.value_counts().head(15).index) for r in ROLES}
overlap = [{'a': SHORT[a], 'b': SHORT[b],
            'j': round(len(top[a] & top[b]) / len(top[a] | top[b]), 2)}
           for a in ROLES for b in ROLES]
pd.DataFrame(overlap).to_csv(f'{OUT}/role_overlap.csv', index=False)

# ── skill_premium_da: mid-level DA only (level-controlled) ────
ms = m.merge(s[s.level == 'mid'][['job_id', 'salary_year_avg']], on='job_id')
da = ms[ms.job_title_short == 'Data Analyst']
da_sal = da.groupby('job_id').salary_year_avg.first()
prem = []
for skill in da.skills.value_counts().head(12).index:
    ids = set(da[da.skills == skill].job_id)
    w, wo = da_sal[da_sal.index.isin(ids)], da_sal[~da_sal.index.isin(ids)]
    prem.append({'skill': skill, 'premium': round(w.median() - wo.median(), 0),
                 'demandPct': round(len(ids) / da.job_id.nunique() * 100, 1), 'n': len(w)})
prem_df = pd.DataFrame(prem)
prem_df.to_csv(f'{OUT}/skill_premium_da.csv', index=False)

# ── role_ladder ───────────────────────────────────────────────
lad = s.groupby(['job_title_short', 'level']).salary_year_avg.median().round(0) \
       .unstack()[['junior', 'mid', 'senior']].loc[ROLES].reset_index() \
       .rename(columns={'job_title_short': 'role'})
lad.to_csv(f'{OUT}/role_ladder.csv', index=False)

# ── remote_premium (senior rows are the story) ────────────────
rp = []
for r in ROLES:
    for lv in ['mid', 'senior']:
        dd = s[(s.job_title_short == r) & (s.level == lv)]
        on, rem = dd[~dd.job_work_from_home].salary_year_avg.median(), \
                  dd[dd.job_work_from_home].salary_year_avg.median()
        rp.append({'role': r, 'level': lv, 'onsite': round(on, 0),
                   'remote': round(rem, 0), 'diff': round(rem - on, 0)})
rp_df = pd.DataFrame(rp)
rp_df.to_csv(f'{OUT}/remote_premium.csv', index=False)

# ── vietnam_postings ──────────────────────────────────────────
vn = f[f.job_country == 'Vietnam'].job_title_short.value_counts() \
      .reindex(ROLES).reset_index()
vn.columns = ['role', 'postings']
vn.to_csv(f'{OUT}/vietnam_postings.csv', index=False)

# ── JS BLOCK ──────────────────────────────────────────────────
def js(name, obj):
    print(f'export const {name} = ' + json.dumps(obj, indent=2) + '\n')

print('\n// ════════ JS BLOCK — paste into src/data/project1_roles.js ════════\n')
js('roleSalary', [{**r, 'short': SHORT[r['role']]} for r in role_salary.to_dict('records')])
js('roleTrend', trend.to_dict('records'))
js('roleBarriers', barriers.to_dict('records'))
js('overlapMatrix', overlap)
js('skillPremiumsDA', prem_df.to_dict('records'))
js('roleLadder', lad.to_dict('records'))
js('remotePremium', rp_df.to_dict('records'))
js('vietnamPostings', vn.to_dict('records'))
print('// ════════ END JS BLOCK ════════')
