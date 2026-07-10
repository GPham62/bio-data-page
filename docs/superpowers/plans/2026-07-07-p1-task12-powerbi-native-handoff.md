# HANDOFF — Task 12: Power BI native (star schema + DAX/Power Query)

**Resume with:** "Continue P1 Task 12 from `docs/superpowers/plans/2026-07-07-p1-task12-powerbi-native-handoff.md`. Power BI Desktop is open with `powerbi/p1/p1.pbix`."

## The pivot (why this doc supersedes Task 12 of the main plan)

Original Task 12 imported one pre-computed CSV per analysis into Power BI. **Rejected.** New approach: import the **raw star schema** and compute every finding in-tool with DAX + Power Query — so the report demonstrates real Power BI skill, not a CSV loader.

## Done this session

- Deleted all 14 CSVs in `powerbi/p1/analysis/` (8 were git-tracked → staged deletions; 6 untracked). Folder empty. Nothing in `src/` referenced them — web page reads JS modules, so the site is unaffected.
- Confirmed source schema (below). Designed the finding→measure map and drafted the DAX.

## Source schema (`powerbi/p1/project1_data/`)

- `job_postings_fact`: job_id, company_id, job_title_short, job_title, job_location, job_via, job_schedule_type, **job_work_from_home** (text "True"/"False"), search_location, **job_posted_date** (datetime), **job_no_degree_mention** (text "True"/"False"), job_health_insurance, **job_country**, salary_rate, **salary_year_avg** (blank on non-yearly rows), salary_hour_avg
- `skills_job_dim`: job_id, skill_id  (bridge)
- `skills_dim`: skill_id, skills, type
- `company_dim`: company_id, name, link, link_google, thumbnail

## Current PBI state

Model is **EMPTY** (`tables_count: 0`). MCP can create measures/columns and run DAX, but **cannot import tables, author Power Query, or make relationships** — those are GUI steps the user drives.

## Pending — user drives in Desktop, then Claude authors DAX

**Step 1 — Import.** Get Data → Text/CSV → all 4 from `project1_data/` → **Transform Data**.

**Step 2 — Power Query (on `job_postings_fact`):**
- Set `job_no_degree_mention` + `job_work_from_home` → Data Type **True/False**.
- Confirm `job_posted_date` Date/Time, `salary_year_avg` Decimal.
- Add Column → Custom Column `Seniority Level`:
```m
let t = Text.Lower([job_title]) in
if Text.Contains(t,"senior") or Text.Contains(t,"sr.") or Text.Contains(t,"sr ") or Text.Contains(t,"staff") or Text.Contains(t,"principal") or Text.Contains(t,"lead") then "senior"
else if Text.Contains(t,"junior") or Text.Contains(t,"jr.") or Text.Contains(t,"jr ") or Text.Contains(t,"entry") or Text.Contains(t,"intern") or Text.Contains(t,"graduate") or Text.Contains(t,"trainee") then "junior"
else "mid"
```
Close & Apply.

**Step 3 — Relationships (Model view):**
- `skills_job_dim[job_id]` → `job_postings_fact[job_id]` — cross-filter **Both**
- `skills_job_dim[skill_id]` → `skills_dim[skill_id]` — single
- `job_postings_fact[company_id]` → `company_dim[company_id]` — single

## Then Claude: reconnect MCP, `get_relationships` to verify star, create these measures on `job_postings_fact`

Salary window filter reused everywhere: `salary_year_avg >= 10000 && salary_year_avg <= 600000` (blanks auto-excluded). Sanity anchors: DA median ≈ $88K (mid), DA junior share ≈ 7.7%, DA↔BA Jaccard ≈ 0.88, DA python premium ≈ +$13K, Vietnam DE ≈ 1,608.

**6 straightforward (author + verify with a card each):**
```dax
Median Salary = MEDIANX(FILTER(job_postings_fact,
  job_postings_fact[salary_year_avg]>=10000 && job_postings_fact[salary_year_avg]<=600000),
  job_postings_fact[salary_year_avg])

Salary P25 = PERCENTILEX.INC(FILTER(job_postings_fact,
  job_postings_fact[salary_year_avg]>=10000 && job_postings_fact[salary_year_avg]<=600000),
  job_postings_fact[salary_year_avg], 0.25)

Salary P75 = PERCENTILEX.INC(FILTER(job_postings_fact,
  job_postings_fact[salary_year_avg]>=10000 && job_postings_fact[salary_year_avg]<=600000),
  job_postings_fact[salary_year_avg], 0.75)

Junior Share % = DIVIDE(
  CALCULATE(COUNTROWS(job_postings_fact), job_postings_fact[Seniority Level]="junior"),
  COUNTROWS(job_postings_fact))            -- format: percentage

No-Degree Share % = DIVIDE(
  CALCULATE(COUNTROWS(job_postings_fact), job_postings_fact[job_no_degree_mention]=TRUE()),
  COUNTROWS(job_postings_fact))            -- format: percentage

Vietnam Postings = CALCULATE(COUNTROWS(job_postings_fact), job_postings_fact[job_country]="Vietnam")
```
```dax
Skills per Posting = MEDIANX(VALUES(job_postings_fact[job_id]), CALCULATE(COUNTROWS(skills_job_dim)))

Degree Penalty ($) =
VAR MedDeg = MEDIANX(FILTER(job_postings_fact,
    job_postings_fact[Seniority Level]="mid" && job_postings_fact[job_no_degree_mention]=FALSE()
    && job_postings_fact[salary_year_avg]>=10000 && job_postings_fact[salary_year_avg]<=600000),
    job_postings_fact[salary_year_avg])
VAR MedNoDeg = MEDIANX(FILTER(job_postings_fact,
    job_postings_fact[Seniority Level]="mid" && job_postings_fact[job_no_degree_mention]=TRUE()
    && job_postings_fact[salary_year_avg]>=10000 && job_postings_fact[salary_year_avg]<=600000),
    job_postings_fact[salary_year_avg])
RETURN MedNoDeg - MedDeg      -- mid-level only = level-controlled; DA≈-$378, DS/SE≈-$25K
```

**2 advanced — author live, iterate with `validate_dax` (the portfolio showpieces):**

`Skill Premium ($)` — used on a visual with `skills_dim[skills]` on axis, DA jobs only. WITH-skill comes from filter context (needs the Both-direction bridge); WITHOUT = DA-mid median stripped of skill filter. Draft to iterate:
```dax
Skill Premium ($) =
VAR Base = FILTER(ALL(job_postings_fact),
    job_postings_fact[job_title_short]="Data Analyst" && job_postings_fact[Seniority Level]="mid"
    && job_postings_fact[salary_year_avg]>=10000 && job_postings_fact[salary_year_avg]<=600000)
VAR WithSkill = MEDIANX(KEEPFILTERS(Base), job_postings_fact[salary_year_avg])   -- filter ctx = current skill
VAR NoSkill   = MEDIANX(Base, job_postings_fact[salary_year_avg])                -- all DA-mid, skill removed
RETURN WithSkill - NoSkill
```
Also `Skill Demand %` = DA postings with the skill ÷ all DA postings, for the scatter's x-axis.

`Jaccard Overlap` — role×role matrix (skill-set transition cost). Needs a disconnected second role table for the columns:
- Create calc table `RoleB = DISTINCT(job_postings_fact[job_title_short])` (no relationship — used only as column axis).
- Measure: top-15 skills of the row role (TOPN by posting count over `skills_dim[skills]`), top-15 of `RoleB`, then `COUNTROWS(INTERSECT) / COUNTROWS(UNION)`. Diagonal = 1. Build with TOPN + INTERSECT/UNION over virtual skill tables; validate against anchor DA↔BA ≈ 0.88.

## After measures — build the 2 pages (unchanged from main plan Task 12 steps 5–10)

Page 1 "The Face-Off": role slicer (`job_title_short`), KPI cards, Median+P25/P75 bar, postings-by-month line, `role_ladder` matrix (rows role × cols Seniority Level, value Median Salary). Page 2 "Switching Costs": Jaccard matrix, Skill Premium scatter, barriers bars, Vietnam multi-row card, confounder note. Theme dark `#0d1117`, accents `#00e5ff #a371f7 #00cc96 #ff6b35 #636e7b`. Screenshots → `public/p1_dashboard_faceoff.png` + `public/p1_dashboard_switching.png`. Commit per main-plan Task 12 step 10.

## Open item

`project1_roles_pipeline.py` still writes analysis CSVs if re-run. Web page uses its JS-block output, not the CSVs. If the pipeline won't be re-run, leave it (YAGNI). If it will, strip the `.to_csv` calls, keep the JS block.

## Session settings note

Ponytail auto-loads (plugin). Caveman does not — re-invoke `/caveman lite` in the new session if you want terse replies.
