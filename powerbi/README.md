# Project 1 → Power BI Desktop report

Source data for a Power BI rebuild of **Project 1 (Recruit / Job-Market Analysis)**.

## Where this data comes from

The portfolio site does **not** read from MotherDuck at runtime — the numbers are
**hardcoded** in [`src/data/project1.js`](../src/data/project1.js) (exported once from
the Colab/MotherDuck analysis and pasted in as static arrays). These CSVs are a faithful
1:1 export of those arrays so Power BI shows the same figures as the website.

> Tech-stack pills on the page (DuckDB / MotherDuck) describe the *original* analysis
> pipeline, not a live connection.

## Files (`p1/analysis/`)

| CSV | Columns | Mirrors website chart |
|---|---|---|
| `salary_by_title.csv`    | title, median_salary            | §01 Salary by role (bar) |
| `remote_by_title.csv`    | title, remote_pct               | §01 Remote % by role (bar) |
| `monthly_trend.csv`      | date, month_label, postings, remote_pct | §02 Monthly trend (dual-axis line) |
| `top_skills.csv`         | skill, postings_count           | §03 Top skills (bar) |
| `top_countries.csv`      | country, postings               | §03 Top countries (bar) |
| `feature_importance.csv` | feature, importance, direction, direction_label | §04 ML feature impact (diverging bar) |
| `ml_metrics.csv`         | metric, value, kind             | §04 ML score cards |
| `kpi_stats.csv`          | metric, value_num, value_text   | KPI header row (cards) |

## Step 1 — Import the CSVs (you do this in Desktop)

The MCP server can create measures/relationships and run DAX, but it **cannot import
rows or draw visuals** — those are UI-only. So:

1. In the open Power BI Desktop report: **Home → Get data → Text/CSV**.
2. Pick a CSV from `powerbi/p1/analysis/`, click **Load**. Repeat for all 8.
   - Tip: **Get data → Folder** can batch them, but the schemas differ, so loading
     each file individually is simpler here.
3. In **Model view**, confirm the 8 tables appear. Check data types:
   - `monthly_trend[date]` → **Date**
   - `*_pct`, `median_salary`, `importance`, `value` → **Decimal/Whole number**

Once any table is loaded, the model database goes live and I can connect.

## Step 2 — I build the model (via MCP, after you've imported)

Tell me "imported" and I'll connect and add these automatically:

**Measures**
- `Total Postings (Top 10 Countries)` = `SUM(top_countries[postings])`
- `Total Skill Demand` = `SUM(top_skills[postings_count])`
- `Total Monthly Postings` = `SUM(monthly_trend[postings])`
- `Latest Remote %` = remote_pct at the max date
- `Remote % Growth (pp)` = last remote_pct − first remote_pct
- `Top Median Salary` = `MAX(salary_by_title[median_salary])`
- `Salary Spread` = max − min median salary
- KPI scalars from `kpi_stats`: `KPI Total Postings`, `KPI Median Salary`,
  `KPI Countries`, `KPI Model Accuracy` (formatted for cards)
- ML lookups from `ml_metrics`: `Accuracy`, `ROC-AUC`, `F1`, `Baseline`

**Optional `Roles` dimension** — `salary_by_title` and `remote_by_title` share the
`title` key, so a small Roles table lets one slicer filter both. I'll create it on request.

## Step 3 — Build the visuals (you, in Desktop)

The MCP can't place visuals, so here's the recommended layout to match the website
(dark theme — set **View → Themes → a dark theme** or import a custom JSON):

**Page 1 — Overview**
- Top: 4–5 **Card** visuals → the `KPI *` measures (Total Postings, Median Salary,
  Countries, Model Accuracy).
- Left: **Clustered bar** — `salary_by_title` (Axis: title, Value: median_salary), sorted desc.
- Right: **Clustered bar** — `remote_by_title` (Axis: title, Value: remote_pct).

**Page 2 — Trends & demand**
- **Line chart** (dual axis): `monthly_trend` — Axis: date, Y1: postings, Y2: remote_pct.
- **Clustered bar**: `top_skills` (skill / postings_count).
- **Clustered bar**: `top_countries` (country / postings).

**Page 3 — ML model**
- 4 **Cards**: Accuracy, ROC-AUC, F1, Baseline (from `ml_metrics`).
- **Diverging bar**: `feature_importance` — Axis: feature, Value: importance,
  **Color by `direction_label`** (Higher pay = green, Lower pay = red) to mirror the site.

## Recreate the CSVs later

Re-run after editing `src/data/project1.js`:

```powershell
node powerbi/export_project1.mjs
```
