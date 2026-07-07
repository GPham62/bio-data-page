# Project 1 Role-Comparison Rework + Power BI Dashboard — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Pivot Project 1 from descriptive market charts to a role-comparison analysis ("which data career should a game dev switch into?") with 7 sections, a fighting-game hero strip, and a 2-page Power BI dashboard exposed on the portfolio.

**Architecture:** A new Python pipeline script computes all role-comparison cuts from the existing `powerbi/p1/project1_data/` CSVs and emits (a) CSVs for Power BI into `powerbi/p1/analysis/` and (b) a printed JS block that becomes `src/data/project1_roles.js`. The web page consumes only that data module. Power BI is built live with the user (runbook at the end — NOT a subagent task).

**Tech Stack:** React 18 + Vite, Recharts, CSS Modules, react-i18next, Vitest, Python/pandas, Power BI Desktop (free) + DAX.

## Global Constraints

- **i18n:** every user-visible string lands in BOTH `src/locales/en.json` and `src/locales/vi.json` in the same task. Never one ahead of the other.
- **Roles compared (verbatim, always this order):** `Data Analyst`, `Business Analyst`, `Data Engineer`, `Data Scientist`, `Software Engineer`.
- **Role colors (use everywhere):** DA `#00e5ff`, BA `#a371f7`, DE `#00cc96`, DS `#ff6b35`, SE `#636e7b`.
- **Salary filter window:** `salary_year_avg` between 10 000 and 600 000, yearly rates only.
- **Seniority parse (must match everywhere):** senior = title matches `senior|sr[. ]|staff|principal|lead`; junior = `junior|jr[. ]|entry|intern|graduate|trainee`; else mid. Case-insensitive, on raw `job_title`.
- No new npm dependencies. No React Router (state-based routing via `setActive`). Recharts only for charts.
- Tests: Vitest (`npm test` = `vitest run`).
- Commits: conventional prefixes (`feat:`, `data:`, `docs:`), each ends with the Claude co-author trailer per session config.
- Dev data check: `python -X utf8` on Windows (cp1252 will crash on unicode otherwise).

## File Structure

| File | Responsibility |
|---|---|
| `project1_roles_pipeline.py` (create) | Compute every role-comparison cut; write 8 CSVs to `powerbi/p1/analysis/`; print the JS data block |
| `src/data/project1_roles.js` (create) | All role-comparison data consumed by the page (pasted from pipeline output + hand-authored heroCards/verdict) |
| `src/data/project1_roles.test.js` (create) | Shape tests for the data module |
| `src/components/RoleSelectStrip.jsx` + `.module.css` + `.test.jsx` (create) | Fighting-game character-select hero strip |
| `src/components/OverlapHeatmap.jsx` + `.module.css` + `.test.jsx` (create) | 5×5 Jaccard transition-cost matrix |
| `src/pages/Project1.jsx` (rewrite sections) | 7-section narrative + hero + dashboard exposure |
| `src/pages/Project1.module.css` (extend) | verdict table, vietnam card, strip/heatmap page-level styles |
| `src/locales/en.json`, `src/locales/vi.json` (modify `p1.*`) | All new copy |
| `powerbi/p1/p1.pbix` (modify, live session) | 2-page dashboard |
| `public/p1_dashboard_faceoff.png`, `public/p1_dashboard_switching.png` (create, live session) | Dashboard screenshots |

Old exports in `src/data/project1.js` that survive: `mlResults`, `stats`, `pythonUrl`, `sqlUrl`. `salaryByTitle`, `topCountries`, `remoteByTitle`, `topSkills`, `monthlyTrend` become unused by the page after Task 9 (leave the file intact — PBI/legacy CSVs still mirror it; delete nothing).

---

### Task 1: Role-comparison pipeline script

**Files:**
- Create: `project1_roles_pipeline.py`

**Interfaces:**
- Consumes: `powerbi/p1/project1_data/{job_postings_fact,skills_job_dim,skills_dim}.csv`
- Produces: 8 CSVs in `powerbi/p1/analysis/` (`role_salary.csv`, `role_trend.csv`, `role_barriers.csv`, `role_overlap.csv`, `skill_premium_da.csv`, `role_ladder.csv`, `remote_premium.csv`, `vietnam_postings.csv`) and a printed `JS BLOCK` used verbatim in Task 2.

- [ ] **Step 1: Write the script**

```python
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
    pen = (mid[mid.job_no_degree_mention].salary_year_avg.median()
           - mid[~mid.job_no_degree_mention].salary_year_avg.median())
    rows.append({'role': r,
                 'juniorPct': round((d.level == 'junior').mean() * 100, 1),
                 'noDegreePct': round(d.job_no_degree_mention.mean() * 100, 1),
                 'skillsPerPosting': float(skills_per[r]),
                 'degreePenaltyMid': round(pen, 0)})
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
```

- [ ] **Step 2: Run it**

Run: `python -X utf8 project1_roles_pipeline.py`
Expected: 8 CSVs appear in `powerbi/p1/analysis/`; the JS BLOCK prints with `roleSalary` first and 5 rows per role-level table. Sanity anchors (values may drift slightly, must be same ballpark): DA median ≈ 90000, DA juniorPct ≈ 7.7, DA↔BA jaccard ≈ 0.88, python premium ≈ +13000, Vietnam DE ≈ 1608.

- [ ] **Step 3: Verify CSVs**

Run: `ls powerbi/p1/analysis/role_*.csv powerbi/p1/analysis/skill_premium_da.csv powerbi/p1/analysis/remote_premium.csv powerbi/p1/analysis/vietnam_postings.csv`
Expected: 8 files listed.

- [ ] **Step 4: Commit**

```bash
git add project1_roles_pipeline.py powerbi/p1/analysis/
git commit -m "data: add role-comparison pipeline and exports for P1 rework"
```

---

### Task 2: Data module + shape tests

**Files:**
- Create: `src/data/project1_roles.js`
- Test: `src/data/project1_roles.test.js`

**Interfaces:**
- Consumes: JS BLOCK printed by Task 1.
- Produces (exact export names, used by Tasks 3–10): `ROLE_COLORS` (object short→hex), `roleSalary` `[{role, short, n, p25, median, p75}]`, `roleTrend` `[{month, <5 role keys>}]`, `roleBarriers` `[{role, juniorPct, noDegreePct, skillsPerPosting, degreePenaltyMid}]`, `overlapMatrix` `[{a, b, j}]` (25 rows), `skillPremiumsDA` `[{skill, premium, demandPct, n}]`, `roleLadder` `[{role, junior, mid, senior}]`, `remotePremium` `[{role, level, onsite, remote, diff}]`, `vietnamPostings` `[{role, postings}]`, `heroCards` `[{short, role, salary, badgeKey, color}]`, `verdictRows` `[{axisKey, winnerShort, cells: {DA,BA,DE,DS,SE}}]`.

- [ ] **Step 1: Write the failing test**

```js
import { describe, it, expect } from 'vitest'
import * as d from './project1_roles.js'

const ROLES = ['Data Analyst', 'Business Analyst', 'Data Engineer', 'Data Scientist', 'Software Engineer']

describe('project1_roles data module', () => {
  it('covers all 5 roles in every per-role table', () => {
    for (const table of [d.roleSalary, d.roleBarriers, d.roleLadder, d.vietnamPostings])
      expect(table.map(r => r.role)).toEqual(ROLES)
  })
  it('salary rows are ordered p25 <= median <= p75', () => {
    for (const r of d.roleSalary) {
      expect(r.p25).toBeLessThanOrEqual(r.median)
      expect(r.median).toBeLessThanOrEqual(r.p75)
    }
  })
  it('overlap matrix is 5x5 with unit diagonal', () => {
    expect(d.overlapMatrix).toHaveLength(25)
    d.overlapMatrix.filter(c => c.a === c.b).forEach(c => expect(c.j).toBe(1))
  })
  it('trend rows carry every role key', () => {
    for (const key of ROLES) expect(d.roleTrend[0]).toHaveProperty(key)
  })
  it('hero cards: 5 cards with color and badgeKey', () => {
    expect(d.heroCards).toHaveLength(5)
    d.heroCards.forEach(c => { expect(c.color).toMatch(/^#/); expect(c.badgeKey).toBeTruthy() })
  })
  it('verdict has 6 axes and known winners', () => {
    expect(d.verdictRows).toHaveLength(6)
    expect(d.verdictRows.map(v => v.axisKey)).toContain('entry')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/data/project1_roles.test.js`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the module**

Paste the JS BLOCK from Task 1's output verbatim, then append the hand-authored exports below (update `salary` on heroCards and `cells` on verdictRows if the pipeline medians differ from these):

```js
// ── Project 1: role-comparison data (generated by project1_roles_pipeline.py) ──
// <JS BLOCK from pipeline goes here — roleSalary … vietnamPostings>

export const ROLE_COLORS = { DA: '#00e5ff', BA: '#a371f7', DE: '#00cc96', DS: '#ff6b35', SE: '#636e7b' }

// Fighting-game select strip. badgeKey → p1.badge_* locale keys.
export const heroCards = [
  { short: 'DA', role: 'Data Analyst',      salary: 90000,  badgeKey: 'badge_da', color: ROLE_COLORS.DA },
  { short: 'BA', role: 'Business Analyst',  salary: 91800,  badgeKey: 'badge_ba', color: ROLE_COLORS.BA },
  { short: 'DE', role: 'Data Engineer',     salary: 130000, badgeKey: 'badge_de', color: ROLE_COLORS.DE },
  { short: 'DS', role: 'Data Scientist',    salary: 126000, badgeKey: 'badge_ds', color: ROLE_COLORS.DS },
  { short: 'SE', role: 'Software Engineer', salary: 138450, badgeKey: 'badge_se', color: ROLE_COLORS.SE },
]

// Verdict table. axisKey → p1.verdict_axis_* locale keys. Winner per axis from pipeline numbers.
export const verdictRows = [
  { axisKey: 'pay',     winnerShort: 'DE', cells: { DA: '$88K', BA: '$89K', DE: '$125K', DS: '$122K', SE: '$119K' } },
  { axisKey: 'entry',   winnerShort: 'DA', cells: { DA: '7.7%', BA: '5.1%', DE: '3.4%', DS: '6.6%', SE: '3.3%' } },
  { axisKey: 'degree',  winnerShort: 'DA', cells: { DA: '−$0.4K', BA: '−$2K', DE: '−$3K', DS: '−$25K', SE: '−$25K' } },
  { axisKey: 'skills',  winnerShort: 'DA', cells: { DA: '3', BA: '3', DE: '6', DS: '5', SE: '5' } },
  { axisKey: 'switch',  winnerShort: 'BA', cells: { DA: '0.88↔BA', BA: '0.88↔DA', DE: '0.30↔SE', DS: '0.43↔DA', SE: '—' } },
  { axisKey: 'vietnam', winnerShort: 'DE', cells: { DA: '762', BA: '145', DE: '1,608', DS: '790', SE: '465' } },
]
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/data/project1_roles.test.js`
Expected: PASS (6 tests). If `degree`/`switch` cells drifted vs pipeline output, fix the cells, not the test.

- [ ] **Step 5: Commit**

```bash
git add src/data/project1_roles.js src/data/project1_roles.test.js
git commit -m "feat: add role-comparison data module for P1"
```

---

### Task 3: RoleSelectStrip component

**Files:**
- Create: `src/components/RoleSelectStrip.jsx`
- Create: `src/components/RoleSelectStrip.module.css`
- Test: `src/components/RoleSelectStrip.test.jsx`

**Interfaces:**
- Consumes: `heroCards` shape from Task 2; `fmtUSD` from `src/utils/formatters.js`; locale keys `p1.badge_da…badge_se`, `p1.strip_hint` (added here).
- Produces: `<RoleSelectStrip cards={heroCards} />`.

- [ ] **Step 1: Write the failing test**

```jsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import RoleSelectStrip from './RoleSelectStrip.jsx'
import { heroCards } from '../data/project1_roles.js'

describe('RoleSelectStrip', () => {
  it('renders one card per role with its name', () => {
    render(<RoleSelectStrip cards={heroCards} />)
    for (const c of heroCards) expect(screen.getByText(c.role)).toBeInTheDocument()
  })
  it('shows the short code on each card', () => {
    render(<RoleSelectStrip cards={heroCards} />)
    expect(screen.getByText('DA')).toBeInTheDocument()
    expect(screen.getByText('SE')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/components/RoleSelectStrip.test.jsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

`src/components/RoleSelectStrip.jsx`:

```jsx
import React from 'react'
import { useTranslation } from 'react-i18next'
import { fmtUSD } from '../utils/formatters.js'
import styles from './RoleSelectStrip.module.css'

// Fighting-game character select: 5 contender cards under the hero.
export default function RoleSelectStrip({ cards }) {
  const { t } = useTranslation()
  return (
    <div className={styles.strip}>
      {cards.map((c, i) => (
        <div key={c.short} className={styles.card}
             style={{ '--card-accent': c.color, animationDelay: `${0.08 * i}s` }}>
          <span className={styles.short}>{c.short}</span>
          <span className={styles.role}>{c.role}</span>
          <span className={styles.salary}>{fmtUSD(c.salary)}<em>{t('p1.strip_median')}</em></span>
          <span className={styles.badge}>{t(`p1.${c.badgeKey}`)}</span>
        </div>
      ))}
    </div>
  )
}
```

`src/components/RoleSelectStrip.module.css`:

```css
.strip {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.75rem;
  margin-top: 1.5rem;
}
.card {
  display: flex; flex-direction: column; gap: 0.375rem;
  padding: 1rem 0.875rem;
  border: 1px solid rgba(255,255,255,0.08);
  border-top: 2px solid var(--card-accent);
  border-radius: 8px;
  background: rgba(255,255,255,0.02);
  transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease;
}
.card:hover {
  transform: translateY(-4px);
  border-color: var(--card-accent);
  box-shadow: 0 6px 24px -8px var(--card-accent);
}
.short  { font-size: 1.5rem; font-weight: 800; color: var(--card-accent); letter-spacing: .02em; }
.role   { font-size: 0.8125rem; font-weight: 600; color: var(--text, #e6edf3); }
.salary { font-size: 0.9375rem; font-weight: 700; color: var(--text, #e6edf3); }
.salary em { display: block; font-style: normal; font-size: 0.625rem; color: #636e7b; }
.badge {
  margin-top: auto; align-self: flex-start;
  font-size: 0.625rem; font-weight: 600; text-transform: uppercase; letter-spacing: .06em;
  padding: 0.2rem 0.5rem; border-radius: 999px;
  color: var(--card-accent); border: 1px solid var(--card-accent);
  opacity: .9;
}
@media (max-width: 860px) { .strip { grid-template-columns: repeat(2, 1fr); } .card:last-child { grid-column: span 2; } }
```

Add to BOTH locale files inside the `p1` object —

`src/locales/en.json`:
```json
"strip_median": "median salary",
"strip_hint": "5 contenders. Scroll to see who wins.",
"badge_da": "Widest entry door",
"badge_ba": "DA's twin, less code",
"badge_de": "Vietnam #1 · top pay",
"badge_ds": "Highest ceiling, needs degree",
"badge_se": "The baseline I know"
```

`src/locales/vi.json`:
```json
"strip_median": "lương trung vị",
"strip_hint": "5 ứng viên. Cuộn xuống xem ai thắng.",
"badge_da": "Cửa vào rộng nhất",
"badge_ba": "Anh em với DA, ít code hơn",
"badge_de": "Số 1 Việt Nam · lương cao",
"badge_ds": "Trần cao nhất, cần bằng cấp",
"badge_se": "Vạch xuất phát của tôi"
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/components/RoleSelectStrip.test.jsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/RoleSelectStrip.jsx src/components/RoleSelectStrip.module.css src/components/RoleSelectStrip.test.jsx src/locales/en.json src/locales/vi.json
git commit -m "feat: fighting-game role select strip for P1 hero"
```

---

### Task 4: OverlapHeatmap component

**Files:**
- Create: `src/components/OverlapHeatmap.jsx`
- Create: `src/components/OverlapHeatmap.module.css`
- Test: `src/components/OverlapHeatmap.test.jsx`

**Interfaces:**
- Consumes: `overlapMatrix` `[{a, b, j}]` and `ROLE_COLORS` from Task 2.
- Produces: `<OverlapHeatmap matrix={overlapMatrix} />` — 5×5 grid, row = "from", column = "to", cell shows Jaccard 0–1.

- [ ] **Step 1: Write the failing test**

```jsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import OverlapHeatmap from './OverlapHeatmap.jsx'
import { overlapMatrix } from '../data/project1_roles.js'

describe('OverlapHeatmap', () => {
  it('renders 25 value cells', () => {
    render(<OverlapHeatmap matrix={overlapMatrix} />)
    expect(screen.getAllByTestId('cell')).toHaveLength(25)
  })
  it('shows the DA-BA overlap value', () => {
    render(<OverlapHeatmap matrix={overlapMatrix} />)
    const daBa = overlapMatrix.find(c => c.a === 'DA' && c.b === 'BA')
    expect(screen.getAllByText(daBa.j.toFixed(2)).length).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/components/OverlapHeatmap.test.jsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

`src/components/OverlapHeatmap.jsx`:

```jsx
import React from 'react'
import styles from './OverlapHeatmap.module.css'

const ORDER = ['DA', 'BA', 'DE', 'DS', 'SE']

// Cyan intensity scales with Jaccard similarity; diagonal is muted (self = 1).
function cellBg(a, b, j) {
  if (a === b) return 'rgba(99,110,123,0.15)'
  return `rgba(0,229,255,${0.06 + j * 0.55})`
}

export default function OverlapHeatmap({ matrix }) {
  const byKey = Object.fromEntries(matrix.map(c => [`${c.a}|${c.b}`, c.j]))
  return (
    <div className={styles.wrap}>
      <div className={styles.grid} style={{ gridTemplateColumns: `56px repeat(${ORDER.length}, 1fr)` }}>
        <div />
        {ORDER.map(c => <div key={c} className={styles.head}>{c}</div>)}
        {ORDER.map(a => (
          <React.Fragment key={a}>
            <div className={styles.head}>{a}</div>
            {ORDER.map(b => {
              const j = byKey[`${a}|${b}`]
              return (
                <div key={b} data-testid="cell" className={styles.cell}
                     style={{ background: cellBg(a, b, j) }}>
                  {j.toFixed(2)}
                </div>
              )
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}
```

`src/components/OverlapHeatmap.module.css`:

```css
.wrap { overflow-x: auto; }
.grid { display: grid; gap: 3px; min-width: 420px; }
.head {
  display: flex; align-items: center; justify-content: center;
  font-size: 0.6875rem; font-weight: 700; color: #8b949e; padding: 0.25rem;
}
.cell {
  display: flex; align-items: center; justify-content: center;
  font-size: 0.75rem; font-weight: 600; color: #e6edf3;
  border-radius: 4px; padding: 0.625rem 0;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/components/OverlapHeatmap.test.jsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/OverlapHeatmap.jsx src/components/OverlapHeatmap.module.css src/components/OverlapHeatmap.test.jsx
git commit -m "feat: 5x5 skill-overlap heatmap component"
```

---

### Task 5: Hero + KPI row rework

**Files:**
- Modify: `src/pages/Project1.jsx` (hero section, lines ~61–97, and imports)
- Modify: `src/locales/en.json`, `src/locales/vi.json` (`p1` object)

**Interfaces:**
- Consumes: `RoleSelectStrip`, `heroCards` from Tasks 2–3.
- Produces: hero + KPI markup other tasks leave untouched.

- [ ] **Step 1: Update locale keys**

In `en.json` `p1`, replace values of the existing keys:

```json
"title1": "1.6M job ads. 5 careers.",
"title2": "1 switch.",
"sub": "A game developer picks his next data role — with data. Five careers head-to-head on pay, entry barriers, switching cost and skill ROI, across 1.6M job postings (2023–2025).",
"kpi_postings": "Postings Analyzed",
"kpi_postings_sub": "2023 – 2025",
"kpi_countries": "Roles Compared",
"kpi_countries_sub": "head-to-head",
"kpi_salary_rec": "Salary Records",
"kpi_salary_rec_sub": "5 roles · $10K–$600K",
"kpi_median": "Widest Entry Door",
"kpi_median_sub": "DA junior share of postings",
"kpi_r2": "Cheapest Switch",
"kpi_r2_sub": "DA ↔ BA skill overlap",
"kpi_skill": "Top Skill Bet",
"kpi_skill_sub": "Python premium inside DA jobs"
```

In `vi.json` `p1`, same keys:

```json
"title1": "1,6 triệu tin tuyển dụng. 5 nghề.",
"title2": "1 lần chuyển.",
"sub": "Một game developer chọn nghề dữ liệu tiếp theo — bằng dữ liệu. Năm nghề đối đầu về lương, rào cản gia nhập, chi phí chuyển nghề và ROI kỹ năng, trên 1,6 triệu tin tuyển dụng (2023–2025).",
"kpi_postings": "Tin đã phân tích",
"kpi_postings_sub": "2023 – 2025",
"kpi_countries": "Nghề so sánh",
"kpi_countries_sub": "đối đầu trực tiếp",
"kpi_salary_rec": "Bản ghi lương",
"kpi_salary_rec_sub": "5 nghề · $10K–$600K",
"kpi_median": "Cửa vào rộng nhất",
"kpi_median_sub": "tỷ lệ tin junior của DA",
"kpi_r2": "Chuyển nghề rẻ nhất",
"kpi_r2_sub": "độ trùng kỹ năng DA ↔ BA",
"kpi_skill": "Kỹ năng đáng học",
"kpi_skill_sub": "mức cộng lương Python trong việc DA"
```

- [ ] **Step 2: Rework hero + KPI JSX**

In `Project1.jsx`: add imports

```jsx
import RoleSelectStrip from '../components/RoleSelectStrip.jsx'
import OverlapHeatmap  from '../components/OverlapHeatmap.jsx'
import {
  ROLE_COLORS, roleSalary, roleTrend, roleBarriers, overlapMatrix,
  skillPremiumsDA, roleLadder, remotePremium, vietnamPostings,
  heroCards, verdictRows,
} from '../data/project1_roles.js'
```

Add `'Power BI'`, `'DAX'` to the hero tech-pill array. After the `.projectHeroStack` div (inside the hero section, before `linkRow`), insert:

```jsx
<RoleSelectStrip cards={heroCards} />
<p className={styles.stripHint}>{t('p1.strip_hint')}</p>
```

Replace the six `StatCard` lines in the KPI row with:

```jsx
<StatCard label={t('p1.kpi_postings')}   value="1.6M"   sub={t('p1.kpi_postings_sub')}   accent="var(--accent)"  delay={0.05} />
<StatCard label={t('p1.kpi_countries')}  value="5"      sub={t('p1.kpi_countries_sub')}  accent="var(--green)"   delay={0.10} />
<StatCard label={t('p1.kpi_salary_rec')} value="40K"    sub={t('p1.kpi_salary_rec_sub')} accent="var(--purple)"  delay={0.15} />
<StatCard label={t('p1.kpi_median')}     value="7.7%"   sub={t('p1.kpi_median_sub')}     accent="var(--accent2)" delay={0.20} />
<StatCard label={t('p1.kpi_r2')}         value="0.88"   sub={t('p1.kpi_r2_sub')}         accent="var(--green)"   delay={0.25} />
<StatCard label={t('p1.kpi_skill')}      value="+$13K"  sub={t('p1.kpi_skill_sub')}      accent="var(--purple)"  delay={0.30} />
```

Add to `Project1.module.css`:

```css
.stripHint {
  margin-top: 0.625rem;
  font-size: 0.75rem;
  color: #636e7b;
  letter-spacing: 0.02em;
}
```

- [ ] **Step 3: Verify dev render + tests**

Run: `npm test` then `npm run dev` and load the Project 1 page.
Expected: all suites pass; hero shows new title, 5-card strip, 6 new KPIs, no console errors.

- [ ] **Step 4: Commit**

```bash
git add src/pages/Project1.jsx src/pages/Project1.module.css src/locales/en.json src/locales/vi.json
git commit -m "feat: P1 hero rework - 1.6M/5 careers/1 switch + role select strip"
```

---

### Task 6: Section 01 — The Contenders (salary range + demand trend)

**Files:**
- Modify: `src/pages/Project1.jsx` (replace old Section 1 and Section 2, lines ~99–154)
- Modify: both locale files

**Interfaces:**
- Consumes: `roleSalary`, `roleTrend`, `ROLE_COLORS`; Recharts `ErrorBar` (add to the recharts import).
- Produces: single `projectSection` with index "01".

- [ ] **Step 1: Locale keys** — replace/add in `p1` (EN):

```json
"s1_title": "Meet the contenders",
"s1_sub": "Median pay with P25–P75 spread, and who's actually hiring — 5 roles, 2023–2025",
"chart_salary": "Pay: Median + Interquartile Range",
"chart_salary_sub": "USD/year · whiskers = P25–P75",
"chart_trend": "Demand: Monthly Postings per Role",
"chart_trend_sub": "small multiples · shared scale",
"s1_insight": "Data Engineer leads on pay (<strong>$125K mid-level median</strong>) but Data Scientist has the widest spread — high ceiling, high variance. Data Analyst pays least (<strong>$88K</strong>) yet posts the most jobs of any role. Pay and demand point at different winners — which is exactly why one chart was never enough."
```

VI:

```json
"s1_title": "Điểm mặt các ứng viên",
"s1_sub": "Lương trung vị kèm khoảng P25–P75, và ai đang thực sự tuyển — 5 nghề, 2023–2025",
"chart_salary": "Lương: Trung vị + khoảng tứ phân vị",
"chart_salary_sub": "USD/năm · râu = P25–P75",
"chart_trend": "Nhu cầu: Tin đăng hằng tháng theo nghề",
"chart_trend_sub": "biểu đồ nhỏ · cùng thang đo",
"s1_insight": "Data Engineer dẫn đầu về lương (<strong>trung vị $125K bậc giữa</strong>) nhưng Data Scientist có khoảng lương rộng nhất — trần cao, biến động lớn. Data Analyst lương thấp nhất (<strong>$88K</strong>) nhưng lại có nhiều tin tuyển nhất. Lương và nhu cầu chỉ về hai người thắng khác nhau — đó chính là lý do một biểu đồ là không đủ."
```

- [ ] **Step 2: Replace old sections 1+2 with new Section 01**

Add `ErrorBar` to the recharts import line. Then:

```jsx
{/* Section 01: The Contenders */}
<section className="projectSection">
  <SectionTitle index="01" title={t('p1.s1_title')} sub={t('p1.s1_sub')} />
  <div className="projectGrid1">
    <ChartCard title={t('p1.chart_salary')} sub={t('p1.chart_salary_sub')} delay={0.05}>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={roleSalary.map(r => ({ ...r, err: [r.median - r.p25, r.p75 - r.median] }))}
                  layout="vertical" margin={{ left: 0, right: 30 }}>
          <CartesianGrid {...gridProps} horizontal={false} />
          <XAxis type="number" tickFormatter={fmtUSD} {...axisMuted} />
          <YAxis type="category" dataKey="role" width={130} {...axisStrong} />
          <Tooltip content={<ChartTooltip prefix="$" />} />
          <Bar dataKey="median" radius={[0, 3, 3, 0]} barSize={18}>
            {roleSalary.map(r => <Cell key={r.short} fill={ROLE_COLORS[r.short]} />)}
            <ErrorBar dataKey="err" direction="x" width={5} strokeWidth={1.5} stroke="#8b949e" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  </div>

  <div className={styles.multiples}>
    {roleSalary.map((r, i) => (
      <ChartCard key={r.short} title={r.role} sub={`${fmt(roleTrend.reduce((s, m) => s + (m[r.role] || 0), 0))} postings`} delay={0.05 + i * 0.04}>
        <ResponsiveContainer width="100%" height={110}>
          <LineChart data={roleTrend} margin={{ left: 0, right: 8, top: 4 }}>
            <XAxis dataKey="month" hide />
            <YAxis hide domain={[0, 'dataMax']} />
            <Tooltip content={<ChartTooltip />} />
            <Line type="monotone" dataKey={r.role} stroke={ROLE_COLORS[r.short]} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
    ))}
  </div>
  <InsightBlock label={t('p1.insight_label')} text={t('p1.s1_insight')} accent="var(--accent)" />
</section>
```

Add to `Project1.module.css`:

```css
.multiples {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.75rem;
  margin-top: 0.75rem;
}
@media (max-width: 860px) { .multiples { grid-template-columns: 1fr 1fr; } }
```

- [ ] **Step 3: Verify** — `npm test` passes, dev page renders section 01 with range whiskers and 5 sparkline cards.

- [ ] **Step 4: Commit**

```bash
git add src/pages/Project1.jsx src/pages/Project1.module.css src/locales/en.json src/locales/vi.json
git commit -m "feat: P1 section 01 - contenders with salary IQR and demand small multiples"
```

---

### Task 7: Section 02 — Entry Barriers

**Files:**
- Modify: `src/pages/Project1.jsx` (new section after 01)
- Modify: both locale files

**Interfaces:**
- Consumes: `roleBarriers`, `ROLE_COLORS`.
- Produces: section index "02".

- [ ] **Step 1: Locale keys** — EN:

```json
"s2_title": "How hard is the door to open?",
"s2_sub": "Junior-posting share, degree requirements, and the degree penalty — controlled for seniority",
"chart_junior": "Junior Door Width",
"chart_junior_sub": "% of postings at junior level",
"chart_degpen": "The Degree Penalty",
"chart_degpen_sub": "mid-level salary gap: no-degree vs degree postings",
"s2_insight": "The Data Analyst door is the widest: <strong>7.7% junior share</strong> (double Data Engineer's), a typical ask of just <strong>3 skills</strong> (DE asks 6), and <strong>zero degree penalty</strong>. Skipping a degree costs a mid-level Data Scientist <strong>$25K/year</strong>; it costs a Data Analyst nothing. Note: we first saw Software Engineers 'rewarded' for no degree — that reversed once we controlled for seniority. Always check the confounder.",
"confounder_note": "<strong>Method note:</strong> raw medians said no-degree Software Engineer postings pay +$22K. Splitting by seniority flipped it — senior postings simply drop degree requirements. Every degree and remote number on this page is level-controlled."
```

VI:

```json
"s2_title": "Cánh cửa vào nghề khó mở đến đâu?",
"s2_sub": "Tỷ lệ tin junior, yêu cầu bằng cấp, và mức phạt bằng cấp — đã kiểm soát theo cấp bậc",
"chart_junior": "Độ rộng cửa junior",
"chart_junior_sub": "% tin đăng ở cấp junior",
"chart_degpen": "Mức phạt bằng cấp",
"chart_degpen_sub": "chênh lệch lương bậc giữa: không yêu cầu bằng vs có yêu cầu",
"s2_insight": "Cửa vào Data Analyst rộng nhất: <strong>7,7% tin junior</strong> (gấp đôi Data Engineer), tin tuyển thường chỉ đòi <strong>3 kỹ năng</strong> (DE đòi 6), và <strong>không có phạt bằng cấp</strong>. Bỏ qua bằng cấp khiến một Data Scientist bậc giữa mất <strong>$25K/năm</strong>; với Data Analyst thì không mất gì. Lưu ý: ban đầu dữ liệu cho thấy Software Engineer được 'thưởng' khi không cần bằng — điều này đảo ngược khi kiểm soát theo cấp bậc. Luôn kiểm tra biến gây nhiễu.",
"confounder_note": "<strong>Ghi chú phương pháp:</strong> trung vị thô nói tin Software Engineer không yêu cầu bằng trả cao hơn $22K. Tách theo cấp bậc thì kết quả đảo chiều — tin tuyển senior đơn giản là bỏ yêu cầu bằng cấp. Mọi con số về bằng cấp và remote trên trang này đều đã kiểm soát theo cấp bậc."
```

- [ ] **Step 2: Add the section JSX**

```jsx
{/* Section 02: Entry Barriers */}
<section className="projectSection">
  <SectionTitle index="02" title={t('p1.s2_title')} sub={t('p1.s2_sub')} />
  <div className="projectGrid2">
    <ChartCard title={t('p1.chart_junior')} sub={t('p1.chart_junior_sub')} delay={0.05}>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={roleBarriers} layout="vertical" margin={{ left: 0, right: 24 }}>
          <CartesianGrid {...gridProps} horizontal={false} />
          <XAxis type="number" tickFormatter={v => `${v}%`} {...axisMuted} />
          <YAxis type="category" dataKey="role" width={130} {...axisStrong} />
          <Tooltip content={<ChartTooltip suffix="%" />} />
          <Bar dataKey="juniorPct" radius={[0, 3, 3, 0]} barSize={18}>
            {roleBarriers.map(r => {
              const short = roleSalary.find(x => x.role === r.role).short
              return <Cell key={r.role} fill={ROLE_COLORS[short]} />
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>

    <ChartCard title={t('p1.chart_degpen')} sub={t('p1.chart_degpen_sub')} delay={0.1}>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={roleBarriers} layout="vertical" margin={{ left: 0, right: 30 }}>
          <CartesianGrid {...gridProps} horizontal={false} />
          <XAxis type="number" tickFormatter={fmtUSD} {...axisMuted} />
          <YAxis type="category" dataKey="role" width={130} {...axisStrong} />
          <Tooltip content={<ChartTooltip prefix="$" />} />
          <Bar dataKey="degreePenaltyMid" radius={[0, 3, 3, 0]} barSize={18}>
            {roleBarriers.map(r => (
              <Cell key={r.role} fill={r.degreePenaltyMid < -5000 ? '#ef553b' : '#00cc96'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  </div>
  <Note text={t('p1.confounder_note')} accent="var(--accent2)" />
  <InsightBlock label={t('p1.insight_label')} text={t('p1.s2_insight')} accent="var(--accent)" />
</section>
```

- [ ] **Step 3: Verify** — `npm test`; dev page shows both barrier charts, red bars only where penalty is materially negative.

- [ ] **Step 4: Commit**

```bash
git add src/pages/Project1.jsx src/locales/en.json src/locales/vi.json
git commit -m "feat: P1 section 02 - entry barriers with confounder note"
```

---

### Task 8: Sections 03 + 04 — Transition Map & Skill ROI

**Files:**
- Modify: `src/pages/Project1.jsx` (replace old Section 3 incl. countries chart; keep the `SqlCard`)
- Modify: both locale files

**Interfaces:**
- Consumes: `OverlapHeatmap`, `overlapMatrix`, `skillPremiumsDA`; Recharts `ScatterChart, Scatter, LabelList, ReferenceLine` (extend the recharts import).
- Produces: sections "03" and "04". The old countries chart and old skills chart are deleted; `SqlCard` moves to the end of section 03.

- [ ] **Step 1: Locale keys** — EN:

```json
"s3_title": "What does switching actually cost?",
"s3_sub": "Skill-set overlap between roles — Jaccard similarity of each role's top-15 skills",
"chart_overlap": "Role Transition Map",
"chart_overlap_sub": "1.00 = identical skill demands · 0 = nothing shared",
"s3_insight": "Data Analyst and Business Analyst overlap at <strong>0.88</strong> — effectively one job with two titles. DA→DS costs a moderate re-skill (<strong>0.43</strong>); DA→DE is nearly a restart (<strong>0.20</strong>). For someone coming from software, DE shares the most DNA with SE (<strong>0.30</strong>) — the engineering habits transfer.",
"s4_title": "Which skill should a Data Analyst learn next?",
"s4_sub": "Salary premium vs demand, inside mid-level DA postings only (level-controlled)",
"chart_roi": "Skill ROI Quadrant — Data Analyst",
"chart_roi_sub": "x = % of DA postings asking for it · y = median salary lift",
"s4_insight": "<strong>Python adds +$13K</strong> to a mid-level DA salary and appears in a third of postings — the clear next bet. Cloud skills (AWS/Azure) pay well but are asked for less often; Excel is demanded everywhere and pays a <strong>negative</strong> premium. Learn what's scarce-but-paid, not what's everywhere."
```

VI:

```json
"s3_title": "Chuyển nghề thực sự tốn bao nhiêu?",
"s3_sub": "Độ trùng kỹ năng giữa các nghề — hệ số Jaccard trên top-15 kỹ năng mỗi nghề",
"chart_overlap": "Bản đồ chuyển nghề",
"chart_overlap_sub": "1.00 = yêu cầu kỹ năng giống hệt · 0 = không có gì chung",
"s3_insight": "Data Analyst và Business Analyst trùng nhau <strong>0,88</strong> — thực chất là một nghề với hai cái tên. DA→DS tốn công học lại vừa phải (<strong>0,43</strong>); DA→DE gần như làm lại từ đầu (<strong>0,20</strong>). Với người xuất thân từ phần mềm, DE chung nhiều DNA với SE nhất (<strong>0,30</strong>) — thói quen kỹ thuật chuyển giao được.",
"s4_title": "Data Analyst nên học kỹ năng nào tiếp theo?",
"s4_sub": "Mức cộng lương vs nhu cầu, chỉ trong tin DA bậc giữa (đã kiểm soát cấp bậc)",
"chart_roi": "Ma trận ROI kỹ năng — Data Analyst",
"chart_roi_sub": "x = % tin DA yêu cầu · y = mức tăng lương trung vị",
"s4_insight": "<strong>Python cộng +$13K</strong> vào lương DA bậc giữa và xuất hiện trong một phần ba tin đăng — lựa chọn rõ ràng tiếp theo. Kỹ năng cloud (AWS/Azure) trả cao nhưng ít được yêu cầu; Excel bị đòi ở khắp nơi nhưng mức cộng lương <strong>âm</strong>. Hãy học thứ khan hiếm-mà-được-trả, không phải thứ đại trà."
```

- [ ] **Step 2: Replace old Section 3 with sections 03 and 04**

Extend recharts import with `ScatterChart, Scatter, LabelList, ReferenceLine`. Then:

```jsx
{/* Section 03: Transition Map */}
<section className="projectSection">
  <SectionTitle index="03" title={t('p1.s3_title')} sub={t('p1.s3_sub')} />
  <ChartCard title={t('p1.chart_overlap')} sub={t('p1.chart_overlap_sub')} delay={0.05}>
    <OverlapHeatmap matrix={overlapMatrix} />
  </ChartCard>
  <SqlCard title={t('p1.sql_card_title')} code={SQL_SNIPPET} href={sqlUrl} linkLabel={t('p1.sql_link')} accent="var(--accent)" />
  <InsightBlock label={t('p1.insight_label')} text={t('p1.s3_insight')} accent="var(--accent)" />
</section>

{/* Section 04: Skill ROI */}
<section className="projectSection">
  <SectionTitle index="04" title={t('p1.s4_title')} sub={t('p1.s4_sub')} />
  <ChartCard title={t('p1.chart_roi')} sub={t('p1.chart_roi_sub')} delay={0.05}>
    <ResponsiveContainer width="100%" height={340}>
      <ScatterChart margin={{ left: 8, right: 30, top: 16, bottom: 8 }}>
        <CartesianGrid {...gridProps} />
        <XAxis type="number" dataKey="demandPct" name="Demand" tickFormatter={v => `${v}%`} {...axisMuted} />
        <YAxis type="number" dataKey="premium" name="Premium" tickFormatter={fmtUSD} {...axisMuted} />
        <ReferenceLine y={0} stroke="#636e7b" strokeDasharray="4 3" />
        <Tooltip content={<ChartTooltip prefix="$" />} cursor={{ strokeDasharray: '3 3' }} />
        <Scatter data={skillPremiumsDA} fill="#00e5ff">
          {skillPremiumsDA.map(d => (
            <Cell key={d.skill} fill={d.premium >= 0 ? '#00cc96' : '#ef553b'} />
          ))}
          <LabelList dataKey="skill" position="top" style={{ fontSize: '0.6875rem', fill: '#8b949e' }} />
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  </ChartCard>
  <InsightBlock label={t('p1.insight_label')} text={t('p1.s4_insight')} accent="var(--accent)" />
</section>
```

- [ ] **Step 3: Verify** — `npm test`; heatmap renders 5×5, scatter shows ~12 labeled skills with Excel below the zero line.

- [ ] **Step 4: Commit**

```bash
git add src/pages/Project1.jsx src/locales/en.json src/locales/vi.json
git commit -m "feat: P1 sections 03-04 - transition map and skill ROI quadrant"
```

---

### Task 9: Sections 05–07 — ML reframe, Vietnam check, Verdict

**Files:**
- Modify: `src/pages/Project1.jsx` (renumber ML section to 05; add 06, 07; delete old Section 5/RecommendationsList usage)
- Modify: `src/pages/Project1.module.css`
- Modify: both locale files

**Interfaces:**
- Consumes: `mlResults` (unchanged, from `project1.js`), `vietnamPostings`, `verdictRows`, `roleLadder`, `remotePremium`.
- Produces: final page structure; `RecommendationsList` import removed.

- [ ] **Step 1: Locale keys** — EN (replace `s4_*` ML copy → `s5_*`, add new):

```json
"s5_title": "Does a model agree with the eyeballing?",
"s5_sub": "Gradient-boosted regression · US annual salary from seniority, role, skills & state",
"s5_insight": "The model independently confirms the comparison: <strong>seniority explains 47%</strong> of predictable salary variance — more than any skill — and the 'Data Analyst' flag is the single biggest <em>negative</em> driver. Translation: the ladder you pick matters more than the tools you list, which is exactly what the role comparison showed.",
"s6_title": "Does this hold in Vietnam?",
"s6_sub": "Local postings flip the global picture — with honest sample sizes",
"vn_title": "Vietnam reality check",
"vn_caveat": "Only <strong>3,770 of 1.6M postings</strong> are Vietnam-based — and just 145 for Business Analyst. Too thin for salary math (so we don't chart it), but the demand ranking is clear: <strong>Data Engineer leads Vietnam</strong> while Data Analyst leads globally. Aggregate data misleads; check your own market.",
"s7_title": "The verdict",
"s7_sub": "Six axes, five roles, one honest answer",
"verdict_axis_pay": "Mid-level pay",
"verdict_axis_entry": "Junior door width",
"verdict_axis_degree": "Degree penalty",
"verdict_axis_skills": "Skills asked per posting",
"verdict_axis_switch": "Cheapest switch from",
"verdict_axis_vietnam": "Vietnam postings",
"verdict_winner": "wins",
"s7_insight": "<strong>Two-step verdict:</strong> Data Analyst is the entry door — widest junior share, zero degree penalty, 3-skill ask, and an 0.88 overlap with BA as a free fallback. Data Engineer is the growth destination — top mid-level pay, #1 in Vietnam, and the strongest skill bridge back to software engineering. Enter as an analyst; grow toward the pipeline."
```

VI:

```json
"s5_title": "Mô hình có đồng ý với mắt thường không?",
"s5_sub": "Hồi quy gradient-boosted · lương năm tại Mỹ từ cấp bậc, nghề, kỹ năng & bang",
"s5_insight": "Mô hình xác nhận độc lập kết quả so sánh: <strong>cấp bậc giải thích 47%</strong> phương sai lương dự đoán được — hơn mọi kỹ năng — và cờ 'Data Analyst' là yếu tố <em>âm</em> lớn nhất. Nghĩa là: chọn đúng nấc thang quan trọng hơn liệt kê công cụ, đúng như phần so sánh nghề đã chỉ ra.",
"s6_title": "Ở Việt Nam có còn đúng không?",
"s6_sub": "Tin đăng trong nước lật ngược bức tranh toàn cầu — kèm cỡ mẫu trung thực",
"vn_title": "Kiểm chứng thực tế Việt Nam",
"vn_caveat": "Chỉ <strong>3.770 trên 1,6 triệu tin</strong> là ở Việt Nam — và Business Analyst chỉ có 145 tin. Quá mỏng để tính lương (nên chúng tôi không vẽ biểu đồ), nhưng thứ hạng nhu cầu rất rõ: <strong>Data Engineer dẫn đầu Việt Nam</strong> trong khi Data Analyst dẫn đầu toàn cầu. Dữ liệu gộp dễ gây hiểu lầm; hãy kiểm tra thị trường của chính bạn.",
"s7_title": "Phán quyết",
"s7_sub": "Sáu trục, năm nghề, một câu trả lời trung thực",
"verdict_axis_pay": "Lương bậc giữa",
"verdict_axis_entry": "Độ rộng cửa junior",
"verdict_axis_degree": "Phạt bằng cấp",
"verdict_axis_skills": "Số kỹ năng mỗi tin",
"verdict_axis_switch": "Chuyển nghề rẻ nhất từ",
"verdict_axis_vietnam": "Tin đăng Việt Nam",
"verdict_winner": "thắng",
"s7_insight": "<strong>Phán quyết hai bước:</strong> Data Analyst là cửa vào — tỷ lệ junior rộng nhất, không phạt bằng cấp, chỉ đòi 3 kỹ năng, và độ trùng 0,88 với BA làm phương án dự phòng miễn phí. Data Engineer là đích tăng trưởng — lương bậc giữa cao nhất, số 1 Việt Nam, và cây cầu kỹ năng vững nhất nối về software engineering. Vào nghề là analyst; lớn lên hướng về pipeline."
```

Delete from both locales: `s5_title`/`s5_sub` old values are replaced above; remove `recs_title`, `recs_items`, `chart_countries`, `chart_countries_sub`, `chart_skills`, `chart_skills_sub`, `chart_remote`, `chart_remote_sub`, `chart_features` stays (used by ML section).

- [ ] **Step 2: JSX** — renumber ML section's `SectionTitle` to `index="05"` with `t('p1.s5_title')` / `t('p1.s5_sub')` and its InsightBlock to `t('p1.s5_insight')` (ml metric cards and features chart unchanged). Remove the `RecommendationsList` import and old Section 5. Append:

```jsx
{/* Section 06: Vietnam reality check */}
<section className="projectSection">
  <SectionTitle index="06" title={t('p1.s6_title')} sub={t('p1.s6_sub')} />
  <div className={styles.vnCard}>
    <div className={styles.vnTitle}>{t('p1.vn_title')}</div>
    <div className={styles.vnRow}>
      {vietnamPostings.map(v => {
        const short = roleSalary.find(x => x.role === v.role).short
        return (
          <div key={v.role} className={styles.vnStat} style={{ '--vn-accent': ROLE_COLORS[short] }}>
            <span className={styles.vnShort}>{short}</span>
            <span className={styles.vnCount}>{fmt(v.postings)}</span>
            <span className={styles.vnN}>n = {fmt(v.postings)}</span>
          </div>
        )
      })}
    </div>
    <Note text={t('p1.vn_caveat')} accent="var(--accent2)" />
  </div>
</section>

{/* Section 07: Verdict */}
<section className="projectSection">
  <SectionTitle index="07" title={t('p1.s7_title')} sub={t('p1.s7_sub')} />
  <div className={styles.verdictWrap}>
    <table className={styles.verdictTable}>
      <thead>
        <tr>
          <th />
          {['DA', 'BA', 'DE', 'DS', 'SE'].map(s => (
            <th key={s} style={{ color: ROLE_COLORS[s] }}>{s}</th>
          ))}
          <th>{t('p1.verdict_winner')}</th>
        </tr>
      </thead>
      <tbody>
        {verdictRows.map(row => (
          <tr key={row.axisKey}>
            <td className={styles.verdictAxis}>{t(`p1.verdict_axis_${row.axisKey}`)}</td>
            {['DA', 'BA', 'DE', 'DS', 'SE'].map(s => (
              <td key={s} className={row.winnerShort === s ? styles.verdictWin : undefined}>
                {row.cells[s]}
              </td>
            ))}
            <td className={styles.verdictWinner} style={{ color: ROLE_COLORS[row.winnerShort] }}>
              {row.winnerShort}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
  <InsightBlock label={t('p1.insight_label')} text={t('p1.s7_insight')} accent="var(--green)" />
</section>
```

Add to `Project1.module.css`:

```css
.vnCard {
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 8px;
  padding: 1.25rem;
  background: rgba(255,255,255,0.02);
}
.vnTitle { font-size: 0.9375rem; font-weight: 700; margin-bottom: 1rem; }
.vnRow { display: grid; grid-template-columns: repeat(5, 1fr); gap: 0.75rem; margin-bottom: 1rem; }
.vnStat { display: flex; flex-direction: column; gap: 0.25rem; padding: 0.75rem; border-left: 2px solid var(--vn-accent); background: rgba(255,255,255,0.02); border-radius: 4px; }
.vnShort { font-weight: 800; color: var(--vn-accent); }
.vnCount { font-size: 1.125rem; font-weight: 700; }
.vnN { font-size: 0.625rem; color: #636e7b; }
.verdictWrap { overflow-x: auto; }
.verdictTable { width: 100%; border-collapse: collapse; font-size: 0.8125rem; min-width: 560px; }
.verdictTable th, .verdictTable td { padding: 0.625rem 0.75rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.06); }
.verdictAxis { text-align: left !important; color: #8b949e; font-weight: 600; white-space: nowrap; }
.verdictWin { background: rgba(0,204,150,0.12); font-weight: 700; border-radius: 4px; }
.verdictWinner { font-weight: 800; }
@media (max-width: 860px) { .vnRow { grid-template-columns: repeat(2, 1fr); } }
```

- [ ] **Step 3: Verify** — `npm test` (all suites; existing `RecommendationsList.test.jsx` still passes — component remains, only P1 usage removed). Dev page shows 7 sections numbered 01–07.

- [ ] **Step 4: Commit**

```bash
git add src/pages/Project1.jsx src/pages/Project1.module.css src/locales/en.json src/locales/vi.json
git commit -m "feat: P1 sections 05-07 - ML reframe, Vietnam check, verdict table"
```

---

### Task 10: Dashboard exposure section

**Files:**
- Modify: `src/pages/Project1.jsx` (new section 08 between 07 and page end)
- Modify: both locale files

**Interfaces:**
- Consumes: `SqlCard` (reused for DAX), images `public/p1_dashboard_faceoff.png` + `public/p1_dashboard_switching.png` (created in the live PBI session — `public/` paths don't break the build while missing).
- Produces: dashboard section with .pbix download link.

- [ ] **Step 1: Locale keys** — EN:

```json
"s8_title": "The same story, interactive",
"s8_sub": "A 2-page Power BI dashboard with a role slicer — built on the same pipeline CSVs",
"dash_p1_caption": "Page 1 · The Face-Off — every visual reacts to the role slicer",
"dash_p2_caption": "Page 2 · Switching Costs — overlap matrix, skill ROI, entry barriers",
"dash_download": "Download the .pbix",
"dax_card_title": "Degree Penalty ($) — level-controlled DAX measure"
```

VI:

```json
"s8_title": "Cùng câu chuyện, có tương tác",
"s8_sub": "Dashboard Power BI 2 trang với slicer theo nghề — dựng trên cùng bộ CSV pipeline",
"dash_p1_caption": "Trang 1 · The Face-Off — mọi biểu đồ phản ứng theo slicer nghề",
"dash_p2_caption": "Trang 2 · Switching Costs — ma trận trùng kỹ năng, ROI kỹ năng, rào cản gia nhập",
"dash_download": "Tải file .pbix",
"dax_card_title": "Degree Penalty ($) — measure DAX kiểm soát theo cấp bậc"
```

- [ ] **Step 2: JSX** — after Section 07 add:

```jsx
{/* Section 08: Power BI dashboard */}
<section className="projectSection">
  <SectionTitle index="08" title={t('p1.s8_title')} sub={t('p1.s8_sub')} />
  <div className="projectGrid1">
    <ChartCard title={t('p1.dash_p1_caption')} delay={0.05}>
      <img src="/p1_dashboard_faceoff.png" alt={t('p1.dash_p1_caption')} style={{ width: '100%', borderRadius: 6 }} />
    </ChartCard>
    <ChartCard title={t('p1.dash_p2_caption')} delay={0.1}>
      <img src="/p1_dashboard_switching.png" alt={t('p1.dash_p2_caption')} style={{ width: '100%', borderRadius: 6 }} />
    </ChartCard>
  </div>
  <SqlCard
    title={t('p1.dax_card_title')}
    code={DAX_SNIPPET}
    href="https://github.com/GPham62/bio-data-page/raw/main/powerbi/p1/p1.pbix"
    linkLabel={t('p1.dash_download')}
    accent="var(--purple)"
  />
</section>
```

Add near `SQL_SNIPPET` at the top of the file:

```jsx
const DAX_SNIPPET = `Degree Penalty ($) =
-- Same-level comparison: raw medians are confounded by seniority
VAR MedDegree =
    MEDIANX(
        FILTER(job_postings_fact,
            job_postings_fact[job_no_degree_mention] = FALSE()
            && job_postings_fact[salary_year_avg] >= 10000
            && job_postings_fact[salary_year_avg] <= 600000),
        job_postings_fact[salary_year_avg])
VAR MedNoDegree =
    MEDIANX(
        FILTER(job_postings_fact,
            job_postings_fact[job_no_degree_mention] = TRUE()
            && job_postings_fact[salary_year_avg] >= 10000
            && job_postings_fact[salary_year_avg] <= 600000),
        job_postings_fact[salary_year_avg])
RETURN MedNoDegree - MedDegree`
```

- [ ] **Step 3: Verify** — `npm test`; dev page shows section 08 with two (initially broken-image) cards and the DAX card. Broken images are expected until the live PBI session exports the PNGs.

- [ ] **Step 4: Commit**

```bash
git add src/pages/Project1.jsx src/locales/en.json src/locales/vi.json
git commit -m "feat: P1 section 08 - Power BI dashboard exposure with DAX snippet"
```

---

### Task 11: Full verification pass

**Files:** none new.

- [ ] **Step 1: Locale parity** — Run: `python -X utf8 _check_locales.py`
Expected: no missing keys either direction. Fix any drift in the same commit.

- [ ] **Step 2: Full test suite** — Run: `npm test`
Expected: all suites pass, including the 4 new test files.

- [ ] **Step 3: Production build** — Run: `npm run build`
Expected: build succeeds, no unused-import warnings from `Project1.jsx` (drop `topCountries`/`monthlyTrend`-era imports if flagged).

- [ ] **Step 4: Commit any fixes**

```bash
git add -A && git commit -m "test: P1 rework verification pass"
```

---

### Task 12 (LIVE SESSION — not a subagent task): Guided Power BI build

**Prerequisite:** Power BI Desktop open with `powerbi/p1/p1.pbix`; Tasks 1–11 done. Claude connects via `mcp__powerbi__connect_powerbi` and instructs; the user drives. Work through the runbook top to bottom.

**Runbook:**

1. **Load new tables** — Home → Get Data → Text/CSV, import from `powerbi/p1/analysis/`: `role_salary.csv`, `role_barriers.csv`, `role_overlap.csv`, `skill_premium_da.csv`, `role_ladder.csv`, `vietnam_postings.csv`. No relationships needed for these display tables (they're pre-aggregated; leave them disconnected).
2. **Calculated column** on `job_postings_fact` (needed by level-aware measures):
```dax
Seniority Level =
VAR t = LOWER(job_postings_fact[job_title])
RETURN SWITCH(TRUE(),
    CONTAINSSTRING(t,"senior") || CONTAINSSTRING(t,"sr.") || CONTAINSSTRING(t,"sr ")
      || CONTAINSSTRING(t,"staff") || CONTAINSSTRING(t,"principal") || CONTAINSSTRING(t,"lead"), "senior",
    CONTAINSSTRING(t,"junior") || CONTAINSSTRING(t,"jr.") || CONTAINSSTRING(t,"jr ")
      || CONTAINSSTRING(t,"entry") || CONTAINSSTRING(t,"intern")
      || CONTAINSSTRING(t,"graduate") || CONTAINSSTRING(t,"trainee"), "junior",
    "mid")
```
3. **Seven measures** on `job_postings_fact` (create each, then verify with a card visual before moving on):
```dax
Salary Records = COUNTROWS(FILTER(job_postings_fact,
    job_postings_fact[salary_year_avg] >= 10000 && job_postings_fact[salary_year_avg] <= 600000))

Median Salary (5R) = MEDIANX(FILTER(job_postings_fact,
    job_postings_fact[salary_year_avg] >= 10000 && job_postings_fact[salary_year_avg] <= 600000),
    job_postings_fact[salary_year_avg])

Salary P25 = PERCENTILEX.INC(FILTER(job_postings_fact,
    job_postings_fact[salary_year_avg] >= 10000 && job_postings_fact[salary_year_avg] <= 600000),
    job_postings_fact[salary_year_avg], 0.25)

Salary P75 = PERCENTILEX.INC(FILTER(job_postings_fact,
    job_postings_fact[salary_year_avg] >= 10000 && job_postings_fact[salary_year_avg] <= 600000),
    job_postings_fact[salary_year_avg], 0.75)

Junior Share % = DIVIDE(
    CALCULATE(COUNTROWS(job_postings_fact), job_postings_fact[Seniority Level] = "junior"),
    COUNTROWS(job_postings_fact))

No-Degree Share % = DIVIDE(
    CALCULATE(COUNTROWS(job_postings_fact), job_postings_fact[job_no_degree_mention] = TRUE()),
    COUNTROWS(job_postings_fact))

Degree Penalty ($) = [see DAX_SNIPPET in Task 10 — same measure]
```
(Existing `Remote %` measure is reused; `Skills per Posting = DIVIDE(COUNTROWS(skills_job_dim), DISTINCTCOUNT(skills_job_dim[job_id]))` goes on `skills_job_dim` if not present.)
4. **Page-level filter** — both pages: `job_title_short` IN the 5 roles.
5. **Page 1 "Role Comparison" (renamed from "The Face-Off" — plain-English copy rule)** — role slicer (tile style, horizontal, `job_title_short`); KPI cards: Salary Records, Median Salary (5R), Junior Share %, Remote %; bar chart Median Salary by `job_title_short` with P25/P75 as tooltip fields; line chart postings by month (`job_posted_date` month) split by role; table visual from `role_ladder` (junior/mid/senior medians).
6. **Page 2 "Switching Costs"** — matrix visual from `role_overlap` (rows = a, columns = b, values = j, conditional background color); scatter from `skill_premium_da` (x = demandPct, y = premium, legend = skill); clustered bar from `role_barriers` (juniorPct, noDegreePct); multi-row card from `vietnam_postings`; text box with the confounder note.
7. **Theme** — View → Themes → Customize: background `#0d1117`-family dark, accent cycle `#00e5ff, #a371f7, #00cc96, #ff6b35, #636e7b` to match the site.
8. **Verify slicer** — clicking each role updates every Page 1 visual; measures recalc (spot-check DA median ≈ $90K, DS degree penalty ≈ −$25K at mid level via a temporary card + level filter).
9. **Screenshots** — File → Export or Snipping Tool at 100% zoom, full canvas: save as `public/p1_dashboard_faceoff.png` and `public/p1_dashboard_switching.png` (light compression, < 500 KB each preferred).
10. **Save & commit:**
```bash
git add powerbi/p1/p1.pbix powerbi/p1/analysis/ public/p1_dashboard_faceoff.png public/p1_dashboard_switching.png
git commit -m "feat: 2-page role-comparison Power BI dashboard + screenshots"
```

---

### Task 13: Ship

- [ ] **Step 1:** `npm test && npm run build` — all green.
- [ ] **Step 2:** Verify dashboard images render on the local dev Project 1 page (no broken images now).
- [ ] **Step 3:** `git push origin main` — Vercel auto-deploys.
- [ ] **Step 4:** Check https://bio-ta.vercel.app/ Project 1 end-to-end: hero strip, 8 sections, dashboard images, .pbix download link works.

---

## Self-Review Notes

- **Spec coverage:** decision log items #1–13 all map to tasks (pipeline→T1, data→T2, strip→T3/T5, 7 sections→T6–T9, chart types→T6/T8, exposure→T10, PBI 2-page+measures+runbook→T12, ship→T13). Confounder note visible (T7). Vietnam callout with n-counts, no chart (T9).
- **Section numbering:** the web page ends with 8 sections (01–07 analysis + 08 dashboard) — the decision log's "7 sections" refers to the analysis narrative; dashboard exposure is additive per decision #12.
- **Placeholder scan:** dashboard PNGs are intentionally absent until T12 (public/ paths, build-safe) — documented in T10 Step 3, not a TBD.
- **Type consistency:** `roleSalary[].short` used by T6/T7/T9 lookups; `verdictRows[].cells` keyed by short codes; `badgeKey` → `p1.badge_*`; all defined in T2 Interfaces.
