# P1 Power BI 3-Page Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task in the main session. Subagent-driven development is NOT recommended here: most tasks run live against Power BI Desktop through a session-held MCP connection and an interactive validate→reload→screenshot loop. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the 3-page Power BI report designed in `docs/superpowers/specs/2026-07-11-p1-powerbi-report-layout-design.md` on the PBIP project, wire 2 screenshots + a GitHub-Release `.pbix` download into the portfolio web page.

**Architecture:** Model authored live via `powerbi-modeling-mcp` against Power BI Desktop (PBIP `powerbi/p1/p1.pbip` is source of truth, saved back as TMDL). Report pages authored as PBIR JSON via the `powerbi-authoring` plugin skills, verified with `powerbi-report-author validate` + `powerbi-desktop` reload/screenshot. Web changes are a href swap + tests.

**Tech Stack:** Power BI Desktop (PBIP/PBIR), powerbi-modeling-mcp, `@microsoft/powerbi-report-authoring-cli`, `@microsoft/powerbi-desktop-bridge-cli`, DAX, Power Query M, React 18 + Vite + vitest, `gh` CLI.

## Global Constraints

- Salary window everywhere: `salary_year_avg >= 10000 && salary_year_avg <= 600000`. Hourly window pinned by probe in Task 7.
- Theme: bg `#0d1117`, panel `#161b22`, border `#30363d`, text `#e6edf3`, muted `#8b949e`. Role colors: DA `#00e5ff`, BA `#a371f7`, DE `#00cc96`, DS `#ff6b35`, SE `#636e7b`.
- Canvas 1280×720 (16:9) on all pages. Every page has a takeaway title + subtitle (screenshot-first).
- NEVER hand-write PBIR JSON from memory — use the `powerbi-report-authoring` skill's reference files + CLI capability lookup for every visual type before authoring (skill rule).
- While the MCP is connected, the live model is source of truth — do not edit TMDL files directly; after each model task the user presses **Save** in Desktop (writes TMDL), then commit.
- User-facing web strings: update `src/locales/en.json` AND `vi.json` in the same change.
- Windows data probes: `python -X utf8`.
- All commits on branch `worktree-p1-role-comparison-rework`.
- Sanity anchors (from 2026-07-06 handoff): DA mid median ≈ $88K, DA junior share ≈ 7.7%, DA↔BA Jaccard ≈ 0.88, DA python premium ≈ +$13K, Vietnam DE = 1,608, degree penalty DA ≈ −$378 / DS ≈ −$25K, skills-per-posting DE 6 / DA 3.

**Manual user steps (everything else is Claude):** open `powerbi/p1/p1.pbip` in Desktop and keep it open; press Save when a task says so; press Refresh if MCP refresh is unavailable; export the final `.pbix` (File → Export → Power BI template is WRONG — use File → Save a copy / Save As `.pbix`).

---

### Task 1: PBIP git hygiene

**Files:**
- Modify: `.gitignore` (lines 14-15 area)
- Commit: `powerbi/p1/p1.pbip`, `powerbi/p1/p1.SemanticModel/**` (text only), `powerbi/p1/p1.Report/**`

**Interfaces:**
- Produces: committed PBIP baseline every later task diffs against.

- [ ] **Step 1: Update .gitignore** — remove the `!powerbi/p1/p1.pbix` exception (the `.pbix` ships via GitHub Release now, `*.pbix` stays ignored) and ignore PBIP local caches:

```gitignore
# was:
*.pbix
!powerbi/p1/p1.pbix
# becomes:
*.pbix

# Power BI project local state (data cache, user settings)
powerbi/p1/p1.SemanticModel/.pbi/
powerbi/p1/p1.Report/.pbi/
```

- [ ] **Step 2: Verify nothing binary/cache gets staged**

Run: `git add -n powerbi/p1/ .gitignore | grep -i "cache\|\.pbi/\|pbix"`
Expected: no output (nothing from `.pbi/` dirs, no `.pbix`).

- [ ] **Step 3: Commit**

```bash
git add .gitignore powerbi/p1/p1.pbip powerbi/p1/p1.SemanticModel powerbi/p1/p1.Report
git commit -m "chore: commit p1 PBIP source, ignore pbix + local caches"
```

---

### Task 2: Tooling preflight

**Files:** none (environment).

**Interfaces:**
- Produces: working `powerbi-report-author` + `powerbi-desktop` CLIs; live MCP connection named for later tasks.

- [ ] **Step 1: Node + CLIs**

```bash
node --version   # need >= 20
npm install -g @microsoft/powerbi-report-authoring-cli@latest @microsoft/powerbi-desktop-bridge-cli@latest
powerbi-report-author --version
powerbi-desktop --version
```

- [ ] **Step 2: User opens `powerbi/p1/p1.pbip` in Power BI Desktop** (ask, then verify): `powerbi-desktop` CLI list/status command per `references/powerbi-desktop.md` of the powerbi-report-authoring skill — read that file first for exact syntax. Expected: one instance with the p1 report.

- [ ] **Step 3: Connect MCP** — `connection_operations` `ListLocalInstances`, then `Connect` with the instance's `localhost:<port>`. Verify with `table_operations` List: expect `job_postings_fact`, `company_dim`, `skills_dim`, `skills_job_dim` (+ 2 auto date tables).

- [ ] **Step 4: Probe flag-column types** (decides Task 3 M code) — `dax_query_operations` Execute:

```dax
EVALUATE ROW(
  "wfh_true",  CALCULATE(COUNTROWS(job_postings_fact), job_postings_fact[job_work_from_home] = TRUE()),
  "nodeg_true", CALCULATE(COUNTROWS(job_postings_fact), job_postings_fact[job_no_degree_mention] = TRUE()),
  "ins_true",  CALCULATE(COUNTROWS(job_postings_fact), job_postings_fact[job_health_insurance] = TRUE()))
```

Expected: three non-zero counts → all three columns are boolean. If a column errors as text, add a `= "True"` comparison variant to Task 3's labels AND a Power Query type-set for it.

---

### Task 3: Power Query columns on job_postings_fact

**Files:** live model (TMDL `tables/job_postings_fact.tmdl` updates on Desktop Save).

**Interfaces:**
- Produces columns consumed by visuals/measures: `Seniority Level` (text), `Seniority Rank` (int, sort column), `Job Platform` (text, cleaned), `Remote Status`, `Degree Requirement`, `Insurance` (text labels).

- [ ] **Step 1: Read the current partition M** — `partition_operations` Get on `job_postings_fact`. Note the final step name `<LAST>`.

- [ ] **Step 2: Append the 6 custom columns** to the M chain via `partition_operations` Update (replace `<LAST>` with the actual name):

```m
    #"Added Seniority" = Table.AddColumn(#"<LAST>", "Seniority Level", each
        let t = Text.Lower([job_title] ?? "") in
        if Text.Contains(t,"senior") or Text.Contains(t,"sr.") or Text.Contains(t,"sr ") or Text.Contains(t,"staff") or Text.Contains(t,"principal") or Text.Contains(t,"lead") then "senior"
        else if Text.Contains(t,"junior") or Text.Contains(t,"jr.") or Text.Contains(t,"jr ") or Text.Contains(t,"entry") or Text.Contains(t,"intern") or Text.Contains(t,"graduate") or Text.Contains(t,"trainee") then "junior"
        else "mid", type text),
    #"Added Rank" = Table.AddColumn(#"Added Seniority", "Seniority Rank", each
        if [Seniority Level] = "junior" then 1 else if [Seniority Level] = "mid" then 2 else 3, Int64.Type),
    #"Added Platform" = Table.AddColumn(#"Added Rank", "Job Platform", each
        let v = [job_via] ?? "" in if Text.StartsWith(v, "via ") then Text.Range(v, 4) else v, type text),
    #"Added Remote" = Table.AddColumn(#"Added Platform", "Remote Status", each
        if [job_work_from_home] = true then "Remote" else "On-site", type text),
    #"Added Degree" = Table.AddColumn(#"Added Remote", "Degree Requirement", each
        if [job_no_degree_mention] = true then "No degree mention" else "Degree mentioned", type text),
    #"Added Insurance" = Table.AddColumn(#"Added Degree", "Insurance", each
        if [job_health_insurance] = true then "Insurance" else "No insurance", type text)
in
    #"Added Insurance"
```

- [ ] **Step 3: Refresh** `job_postings_fact` (MCP refresh operation — check `table_operations`/`database_operations` Help; fallback: user clicks Refresh in Desktop).

- [ ] **Step 4: Set sort-by-column** — `column_operations` Update: `Seniority Level` sortByColumn = `Seniority Rank`. Hide `Seniority Rank`.

- [ ] **Step 5: Validate** — `dax_query_operations`:

```dax
EVALUATE SUMMARIZECOLUMNS(job_postings_fact[Seniority Level], "n", COUNTROWS(job_postings_fact))
```
Expected: exactly 3 rows (junior/mid/senior), mid largest.

```dax
EVALUATE TOPN(5, SUMMARIZECOLUMNS(job_postings_fact[Job Platform], "n", COUNTROWS(job_postings_fact)), [n], DESC)
```
Expected: single "LinkedIn" row at #1 — no separate "via LinkedIn".

- [ ] **Step 6: User saves in Desktop → commit**

```bash
git add powerbi/p1/p1.SemanticModel
git commit -m "feat(p1-model): seniority, cleaned platform, drill label columns"
```

---

### Task 4: Skills bridge relationship → Both

**Interfaces:**
- Produces: `skills_job_dim[job_id] → job_postings_fact[job_id]` cross-filter **Both** (required by Jaccard/Skill measures).

- [ ] **Step 1:** `relationship_operations` List → find relationship `skills_job_dim.job_id → job_postings_fact.job_id`; Update its crossFilteringBehavior to `BothDirections`.

- [ ] **Step 2: Validate the bridge filters skills from the fact side:**

```dax
EVALUATE ROW("da_skills",
  CALCULATE(DISTINCTCOUNT(skills_dim[skills]),
    job_postings_fact[job_title_short] = "Data Analyst"))
```
Expected: a number well below total distinct skills (filter reaches skills_dim) and > 100.

- [ ] **Step 3: Save in Desktop → commit** (`git add powerbi/p1/p1.SemanticModel && git commit -m "feat(p1-model): both-direction skills bridge"`).

---

### Task 5: Core measures (create/replace via measure_operations, validate each with dax_query_operations)

**Interfaces:**
- Produces measures (exact names): `Median Salary` (replaced), `Salary P25`, `Salary P75`, `Junior Share %`, `No-Degree Share %`, `Vietnam Postings`, `Skills per Posting`, `Degree Penalty ($)`, `DA Junior Share %`, `Top Role Median`. Format strings noted per measure.

- [ ] **Step 1: Replace `Median Salary`** (existing one is unwindowed) — format `$#,0,K`:

```dax
Median Salary = MEDIANX(FILTER(job_postings_fact,
  job_postings_fact[salary_year_avg] >= 10000 && job_postings_fact[salary_year_avg] <= 600000),
  job_postings_fact[salary_year_avg])
```

- [ ] **Step 2: Add the batch** (all on `job_postings_fact`):

```dax
Salary P25 = PERCENTILEX.INC(FILTER(job_postings_fact,
  job_postings_fact[salary_year_avg] >= 10000 && job_postings_fact[salary_year_avg] <= 600000),
  job_postings_fact[salary_year_avg], 0.25)                       -- $#,0,K

Salary P75 = PERCENTILEX.INC(FILTER(job_postings_fact,
  job_postings_fact[salary_year_avg] >= 10000 && job_postings_fact[salary_year_avg] <= 600000),
  job_postings_fact[salary_year_avg], 0.75)                       -- $#,0,K

Junior Share % = DIVIDE(
  CALCULATE(COUNTROWS(job_postings_fact), job_postings_fact[Seniority Level] = "junior"),
  COUNTROWS(job_postings_fact))                                   -- 0.0%

No-Degree Share % = DIVIDE(
  CALCULATE(COUNTROWS(job_postings_fact), job_postings_fact[job_no_degree_mention] = TRUE()),
  COUNTROWS(job_postings_fact))                                   -- 0.0%

Vietnam Postings = CALCULATE(COUNTROWS(job_postings_fact),
  job_postings_fact[job_country] = "Vietnam")                     -- #,0

Skills per Posting = MEDIANX(VALUES(job_postings_fact[job_id]),
  CALCULATE(COUNTROWS(skills_job_dim)))                           -- 0

Degree Penalty ($) =
VAR MedDeg = MEDIANX(FILTER(job_postings_fact,
    job_postings_fact[Seniority Level] = "mid" && job_postings_fact[job_no_degree_mention] = FALSE()
    && job_postings_fact[salary_year_avg] >= 10000 && job_postings_fact[salary_year_avg] <= 600000),
    job_postings_fact[salary_year_avg])
VAR MedNoDeg = MEDIANX(FILTER(job_postings_fact,
    job_postings_fact[Seniority Level] = "mid" && job_postings_fact[job_no_degree_mention] = TRUE()
    && job_postings_fact[salary_year_avg] >= 10000 && job_postings_fact[salary_year_avg] <= 600000),
    job_postings_fact[salary_year_avg])
RETURN MedNoDeg - MedDeg                                          -- $#,0

DA Junior Share % = CALCULATE([Junior Share %],
  job_postings_fact[job_title_short] = "Data Analyst")            -- 0.0%

Top Role Median = MAXX(VALUES(job_postings_fact[job_title_short]), [Median Salary])   -- $#,0,K
```

- [ ] **Step 3: Validate against anchors:**

```dax
EVALUATE ROW(
  "da_mid_median", CALCULATE([Median Salary], job_postings_fact[job_title_short]="Data Analyst", job_postings_fact[Seniority Level]="mid"),
  "da_junior", [DA Junior Share %],
  "vn_de", CALCULATE([Vietnam Postings], job_postings_fact[job_title_short]="Data Engineer"),
  "spp_de", CALCULATE([Skills per Posting], job_postings_fact[job_title_short]="Data Engineer"),
  "degpen_da", CALCULATE([Degree Penalty ($)], job_postings_fact[job_title_short]="Data Analyst"),
  "degpen_ds", CALCULATE([Degree Penalty ($)], job_postings_fact[job_title_short]="Data Scientist"))
```
Expected: ≈88000 · ≈0.077 · 1608 · 6 · ≈−378 · ≈−25000. Investigate any mismatch before proceeding.

- [ ] **Step 4: Save in Desktop → commit** (`git commit -m "feat(p1-model): core windowed measures"`).

---

### Task 6: Showpiece measures — RoleB, Skill Demand %, Skill Premium ($), Jaccard Overlap

**Interfaces:**
- Produces: calculated table `RoleB` (single column `Role`); measures `Skill Demand %` (0.0%), `Skill Premium ($)` ($#,0), `Jaccard Overlap` (0.00). These are iterate-until-anchors measures — expect DAX debugging.

- [ ] **Step 1: Create disconnected table** via `table_operations` (calculated table, NO relationships):

```dax
RoleB = SELECTCOLUMNS(DISTINCT(job_postings_fact[job_title_short]), "Role", job_postings_fact[job_title_short])
```

- [ ] **Step 2: Skill measures** (on `job_postings_fact`):

```dax
Skill Demand % =
VAR WithSkill = CALCULATE(DISTINCTCOUNT(job_postings_fact[job_id]))
VAR AllJobs = CALCULATE(DISTINCTCOUNT(job_postings_fact[job_id]),
    REMOVEFILTERS(skills_dim), REMOVEFILTERS(skills_job_dim))
RETURN DIVIDE(WithSkill, AllJobs)

Skill Premium ($) =
VAR Base = FILTER(ALL(job_postings_fact),
    job_postings_fact[job_title_short] = "Data Analyst" && job_postings_fact[Seniority Level] = "mid"
    && job_postings_fact[salary_year_avg] >= 10000 && job_postings_fact[salary_year_avg] <= 600000)
VAR WithSkill = MEDIANX(KEEPFILTERS(Base), job_postings_fact[salary_year_avg])
VAR NoSkill   = MEDIANX(Base, job_postings_fact[salary_year_avg])
RETURN WithSkill - NoSkill
```

- [ ] **Step 3: Jaccard** (on `job_postings_fact`):

```dax
Jaccard Overlap =
VAR RoleA = SELECTEDVALUE(job_postings_fact[job_title_short])
VAR RoleBv = SELECTEDVALUE(RoleB[Role])
VAR TopA = SELECTCOLUMNS(
    TOPN(15, ADDCOLUMNS(
        CALCULATETABLE(VALUES(skills_dim[skills]), job_postings_fact[job_title_short] = RoleA),
        "@cnt", CALCULATE(COUNTROWS(skills_job_dim), job_postings_fact[job_title_short] = RoleA)),
      [@cnt], DESC),
    "s", skills_dim[skills])
VAR TopB = SELECTCOLUMNS(
    TOPN(15, ADDCOLUMNS(
        CALCULATETABLE(VALUES(skills_dim[skills]), job_postings_fact[job_title_short] = RoleBv),
        "@cnt", CALCULATE(COUNTROWS(skills_job_dim), job_postings_fact[job_title_short] = RoleBv)),
      [@cnt], DESC),
    "s", skills_dim[skills])
RETURN IF(NOT ISBLANK(RoleA) && NOT ISBLANK(RoleBv),
    DIVIDE(COUNTROWS(INTERSECT(TopA, TopB)), COUNTROWS(DISTINCT(UNION(TopA, TopB)))))
```

- [ ] **Step 4: Validate against anchors** (iterate the DAX until these hit; TOPN ties can nudge values slightly — ±0.03 on Jaccard is acceptable):

```dax
EVALUATE ROW(
  "jac_da_ba", CALCULATE([Jaccard Overlap], job_postings_fact[job_title_short]="Data Analyst", RoleB[Role]="Business Analyst"),
  "jac_diag",  CALCULATE([Jaccard Overlap], job_postings_fact[job_title_short]="Data Analyst", RoleB[Role]="Data Analyst"),
  "py_prem",   CALCULATE([Skill Premium ($)], skills_dim[skills]="python"),
  "sql_dem",   CALCULATE([Skill Demand %], skills_dim[skills]="sql",
                 job_postings_fact[job_title_short]="Data Analyst", job_postings_fact[Seniority Level]="mid"))
```
Expected: ≈0.88 · exactly 1.0 · ≈+13000 · ≈0.5 (sql appears in roughly half of DA postings — sanity, not a hard anchor).

- [ ] **Step 5: Save in Desktop → commit** (`git commit -m "feat(p1-model): skill premium + jaccard showpiece measures"`).

---

### Task 7: Drill-page measures

**Interfaces:**
- Produces: `Median Hourly Salary`, `Avg Salary`, `Avg Hourly Salary`, `Health Insurance %`, `Drill Role Title`, `Gauge Min Yearly`, `Gauge Max Yearly`, `Gauge Min Hourly`, `Gauge Max Hourly`.

- [ ] **Step 1: Probe the hourly window** (spec: same outlier-trim logic as yearly):

```dax
EVALUATE ROW(
  "p01", PERCENTILEX.INC(FILTER(job_postings_fact, NOT ISBLANK(job_postings_fact[salary_hour_avg])), job_postings_fact[salary_hour_avg], 0.01),
  "p99", PERCENTILEX.INC(FILTER(job_postings_fact, NOT ISBLANK(job_postings_fact[salary_hour_avg])), job_postings_fact[salary_hour_avg], 0.99))
```
Round p01 down / p99 up to clean integers → `<HLO>`/`<HHI>`. Use them verbatim below.

- [ ] **Step 2: Add measures** (on `job_postings_fact`):

```dax
Median Hourly Salary = MEDIANX(FILTER(job_postings_fact,
  job_postings_fact[salary_hour_avg] >= <HLO> && job_postings_fact[salary_hour_avg] <= <HHI>),
  job_postings_fact[salary_hour_avg])                             -- $#,0

Avg Salary = AVERAGEX(FILTER(job_postings_fact,
  job_postings_fact[salary_year_avg] >= 10000 && job_postings_fact[salary_year_avg] <= 600000),
  job_postings_fact[salary_year_avg])                             -- $#,0,K

Avg Hourly Salary = AVERAGEX(FILTER(job_postings_fact,
  job_postings_fact[salary_hour_avg] >= <HLO> && job_postings_fact[salary_hour_avg] <= <HHI>),
  job_postings_fact[salary_hour_avg])                             -- $#,0

Health Insurance % = DIVIDE(
  CALCULATE(COUNTROWS(job_postings_fact), job_postings_fact[job_health_insurance] = TRUE()),
  COUNTROWS(job_postings_fact))                                   -- 0.0%

Drill Role Title = SELECTEDVALUE(job_postings_fact[job_title_short], "All Roles")

Gauge Min Yearly = 10000        -- $#,0,K
Gauge Max Yearly = 600000       -- $#,0,K
Gauge Min Hourly = <HLO>        -- $#,0
Gauge Max Hourly = <HHI>        -- $#,0
```

- [ ] **Step 3: Validate** — DE drill context sanity (screenshot showed median ≈$126K > avg tick $133K region):

```dax
EVALUATE ROW(
  "de_med", CALCULATE([Median Salary], job_postings_fact[job_title_short]="Data Engineer"),
  "de_avg", CALCULATE([Avg Salary], job_postings_fact[job_title_short]="Data Engineer"),
  "de_hr",  CALCULATE([Median Hourly Salary], job_postings_fact[job_title_short]="Data Engineer"),
  "ins",    CALCULATE([Health Insurance %], job_postings_fact[job_title_short]="Data Engineer"))
```
Expected: ≈125-126K · slightly above median · ≈$55-60 · ≈0.10.

- [ ] **Step 4: Save in Desktop → commit** (`git commit -m "feat(p1-model): drill-through measures + gauge bounds"`).

---

### Task 8: Theme + page scaffold (first PBIR task)

**Files:**
- Create: `powerbi/p1/p1.Report/definition/report.json` theme registration + `StaticResources/RegisteredResources/p1-dark.json` (exact paths per the skill's `theming.md`)
- Modify: `powerbi/p1/p1.Report/definition/pages/pages.json`
- Delete: stale page folder `pages/481e1898de9b59023d3a/`

**Interfaces:**
- Produces: 3 page folders (names: `The Face-Off`, `Switching Costs`, `Job Title Drill Through`), 1280×720, themed; active page = The Face-Off.

- [ ] **Step 1: Read `theming.md` + `authoring.md`** (page creation) from the powerbi-report-authoring skill references. Build the theme with: `dataColors` = [`#00e5ff`, `#a371f7`, `#00cc96`, `#ff6b35`, `#636e7b`], background `#0d1117`, panel/card `#161b22`, `textClasses` label color `#e6edf3` / secondary `#8b949e`, visual borders `#30363d`.
- [ ] **Step 2: Author** — delete stale page folder, create the 3 pages (canvas 1280×720), register theme.
- [ ] **Step 3: Validate + reload**: `powerbi-report-author validate powerbi/p1/p1.Report` → expect pass; `powerbi-desktop` reload → screenshot → 3 empty dark pages.
- [ ] **Step 4: Commit** (`git commit -m "feat(p1-report): dark theme + 3-page scaffold"`).

---

### Task 9: Page 1 — "The Face-Off"

**Interfaces:**
- Consumes measures: `Total Postings`, `Salary Records`, `Top Role Median`, `DA Junior Share %`, `Median Salary`, `Salary P25`, `Salary P75`.
- Produces: finished page 1 → final screenshot source for `public/p1_dashboard_faceoff.png`.

Visual spec (positions on 1280×720; read the named reference file + run CLI capability lookup before authoring each type):

| # | Visual (reference file) | x,y,w,h | Fields / config |
|---|---|---|---|
| 1 | textbox (`textbox.md`) | 16,12,700,64 | Title "THE FACE-OFF — 5 data careers, 1.6M job ads" 17pt bold; subtitle line "Data Engineer pays the most. Data Analyst opens the widest door." 10pt `#8b949e` |
| 2 | chiclet-style slicer (`slicers.md`) | 736,12,528,44 | `job_title_short`, horizontal orientation, default all-selected |
| 3-6 | 4 cards (`card.md`) | y=84 h=88, x=16/329/642/955 w=305 | `Total Postings` ("Job postings") · `Salary Records` ("Salary records") · `Top Role Median` ("Top median salary · DE") · `DA Junior Share %` ("Junior door · DA") |
| 7 | clustered column chart (`cartesian.md`) | 16,188,700,340 | Axis `job_title_short`, value `Median Salary`, data labels on, per-role data colors (color-strategy.md), error bars lower=`Salary P25` upper=`Salary P75` — capability-lookup error-bar support first; **fallback if unsupported in PBIR:** add `Salary P25`/`Salary P75` to tooltips and note "P25–P75 in tooltip" in subtitle |
| 8 | matrix (`table.md`) | 732,188,532,340 | Rows `job_title_short`, columns `Seniority Level` (sorts junior→mid→senior via Seniority Rank), values `Median Salary` |
| 9 | line chart (`cartesian.md`) | 16,544,1248,160 | X = `job_posted_date` month (date hierarchy month level), Y = `Total Postings`, single series, area/line, title "Postings by month" |

- [ ] **Step 1: Author visuals 1-2-3-6** (title, slicer, cards) → `powerbi-report-author validate` → reload → screenshot.
- [ ] **Step 2: Author visuals 7-8-9** → validate → reload → screenshot.
- [ ] **Step 3: Screenshot review** (`screenshot-review.md` checklist) vs approved mockup (`.superpowers/brainstorm/10657-1783716305/content/page1-layout.html`, card A): all values populated, KPI numbers match anchors, colors correct, nothing overlapping.
- [ ] **Step 4: Commit** (`git commit -m "feat(p1-report): page 1 The Face-Off"`).

---

### Task 10: Page 2 — "Switching Costs"

**Interfaces:**
- Consumes: `Jaccard Overlap`, `RoleB[Role]`, `Skill Demand %`, `Skill Premium ($)`, `Skill Count`, `Skills per Posting`, `Junior Share %`, `Degree Penalty ($)`, `Vietnam Postings`.
- Produces: finished page 2 → `public/p1_dashboard_switching.png`.

| # | Visual (reference) | x,y,w,h | Fields / config |
|---|---|---|---|
| 1 | textbox | 16,12,1248,56 | "SWITCHING COSTS — how far is the jump?" + subtitle "DA→BA is nearly free (0.88 skill overlap) · Python adds +$13K to a mid-level DA salary" |
| 2 | matrix + conditional formatting (`table.md`, `conditional-formatting.md`) | 16,84,430,270 | Rows `job_title_short`, columns `RoleB[Role]`, values `Jaccard Overlap` (0.00); FillRule background gradient `#102e36` → `#00e5ff`; compact row height — do NOT stretch |
| 3 | bar chart (`cartesian.md`) | 16,362,430,300 | Axis `job_title_short`, value `Skills per Posting`, title "Skills per posting · median required stack", role data colors, labels on |
| 4 | scatter (`cartesian.md`) | 454,84,420,578 | Details `skills_dim[skills]`, X `Skill Demand %`, Y `Skill Premium ($)`, size `Skill Count`; visual filters `job_title_short = Data Analyst`, `Seniority Level = mid`, TopN 10 skills by `Skill Demand %`; category labels ON; title "Skill ROI — mid-level DA" |
| 5 | bar chart | 882,84,382,190 | Axis `job_title_short`, value `Junior Share %`, sort desc, labels, title "Junior door · % open to juniors" |
| 6 | bar chart | 882,282,382,190 | Axis `job_title_short`, value `Degree Penalty ($)`, visual filter role ∈ {Data Analyst, Data Scientist, Software Engineer}, labels, title "No-degree salary gap · mid-level" |
| 7 | multi-row card (`card.md`) | 882,480,382,182 | `job_title_short` + `Vietnam Postings`, title "Vietnam postings" |
| 8 | textbox | 16,670,1248,34 | "⚠ Degree penalty compared within mid-level only — raw comparison is confounded by seniority. BA Vietnam n=145 — too small to chart." 9pt italic `#8b949e` |

- [ ] **Step 1: Author 1-2-3** → validate → reload → screenshot (check matrix gradient + diagonal = 1.00).
- [ ] **Step 2: Author 4-8** → validate → reload → screenshot (check scatter has ≤10 labeled points, no label overlap).
- [ ] **Step 3: Screenshot review** vs mockup `page2-final.html`. Verify Jaccard DA↔BA cell shows 0.88.
- [ ] **Step 4: Commit** (`git commit -m "feat(p1-report): page 2 Switching Costs"`).

---

### Task 11: Page 3 — "Job Title Drill Through"

**Interfaces:**
- Consumes: `Median Salary`, `Avg Salary`, `Median Hourly Salary`, `Avg Hourly Salary`, gauge bounds, `Total Postings`, `Drill Role Title`, columns `Remote Status`, `Degree Requirement`, `Insurance`, `Job Platform`, `job_schedule_type`, `job_location`.
- Produces: drill page reachable from pages 1-2 (download-only bonus; no web screenshot).

- [ ] **Step 1: Read `authoring.md` drillthrough section** — configure page as drillthrough target on `job_postings_fact[job_title_short]`, keep-all-filters default.

| # | Visual (reference) | x,y,w,h | Fields / config |
|---|---|---|---|
| 1 | back button (`authoring.md` actionButton) | 20,20,36,36 | Back action, arrow, `#e6edf3` |
| 2 | textbox | 440,12,400,32 | "Job Title Drill Through" 14pt centered |
| 3 | card | 440,44,400,68 | `Drill Role Title`, callout ~32pt — the dynamic role headline |
| 4 | gauge (capability lookup: `gauge` roles) | 16,128,340,180 | Value `Median Salary`, target `Avg Salary` (target label visible = the "avg" tick), min `Gauge Min Yearly`, max `Gauge Max Yearly`, title "Yearly Salary ($USD) · tick = avg" |
| 5 | gauge | 364,128,340,180 | Value `Median Hourly Salary`, target `Avg Hourly Salary`, min/max hourly bounds, title "Hourly Salary ($USD) · tick = avg" |
| 6 | donut (`capability lookup`) | 720,128,180,180 | Legend `Remote Status`, values `Total Postings`, title "Work From Home %" |
| 7 | donut | 908,128,180,180 | Legend `Degree Requirement`, values `Total Postings`, title "No Degree Mention %" |
| 8 | donut | 1096,128,168,180 | Legend `Insurance`, values `Total Postings`, title "Health Insurance %" |
| 9 | map (`map.md`) | 16,324,688,380 | Location `job_location`, bubble size `Total Postings`, title "Jobs Globally"; if geocoding renders badly → fallback location `job_country` per map.md render-failure workflow |
| 10 | bar chart | 720,324,280,380 | Axis `Job Platform`, value `Total Postings`, TopN 7 by `Total Postings`, title "Job Platform" |
| 11 | treemap (capability lookup) | 1008,324,256,380 | Group `job_schedule_type`, values `Total Postings`, title "Job Schedule Type" |

- [ ] **Step 2: Author all visuals** → validate → reload.
- [ ] **Step 3: Drill test** — in Desktop (or via screenshots after drilling), right-click each of the 5 roles on page 1's column chart → drillthrough → page 3; verify title shows the role, gauges/donuts repopulate, back button returns. Capture one screenshot of the DE drill state and eyeball against the course original's fixed version (cleaned platform bars — one LinkedIn only; labeled avg ticks; dark theme).
- [ ] **Step 4: Commit** (`git commit -m "feat(p1-report): job title drillthrough page"`).

---

### Task 12: Final screenshots → public/

**Files:**
- Create: `public/p1_dashboard_faceoff.png`, `public/p1_dashboard_switching.png` (paths hard-coded in `src/pages/Project1.jsx:413,416` — names must match exactly).

- [ ] **Step 1:** Set slicer to all-roles default state, save; `powerbi-desktop` screenshot page 1 and page 2 at 1280×720 (or 2× if the CLI supports scale — check `powerbi-desktop.md`).
- [ ] **Step 2:** Copy to `public/` with the exact names above. Run `npm run dev` and eyeball section 08 renders both images.
- [ ] **Step 3: Commit** (`git add public/p1_dashboard_*.png && git commit -m "feat(p1-web): dashboard screenshots"`).

---

### Task 13: Export .pbix + GitHub Release

- [ ] **Step 1:** User: File → Save As → `p1_dashboard.pbix` (OUTSIDE the repo or anywhere — it's gitignored regardless). Note the path.
- [ ] **Step 2: Create the release** (repo remote is `GPham62/bio-data-page`):

```bash
gh release create p1-dashboard-v1 "<path-to>/p1_dashboard.pbix" \
  --title "Project 1 — Power BI Dashboard v1" \
  --notes "3-page Power BI report for the Global Tech Recruit analysis: The Face-Off, Switching Costs, Job Title Drill Through. Built on a star schema with native DAX (Skill Premium, Jaccard Overlap)."
```

- [ ] **Step 3: Verify** `curl -sIL https://github.com/GPham62/bio-data-page/releases/download/p1-dashboard-v1/p1_dashboard.pbix | head -1` → `HTTP/2 200`.

---

### Task 14: Web wiring + tests + UX audit

**Files:**
- Modify: `src/pages/Project1.jsx:422` (href), possibly the `DAX_SNIPPET` const in the same file
- Create: `src/pages/p1Download.test.js` (vitest)
- Locales: `src/locales/en.json` / `vi.json` — only if any label text changes (current `dash_download` "Download the .pbix" stays correct)

- [ ] **Step 1: Extract + write failing test first.** In `Project1.jsx`, extract the URL to an exported const so it's testable without rendering:

```js
export const PBIX_DOWNLOAD_URL =
  'https://github.com/GPham62/bio-data-page/releases/download/p1-dashboard-v1/p1_dashboard.pbix'
```

```js
// src/pages/p1Download.test.js
import { describe, it, expect } from 'vitest'
import { PBIX_DOWNLOAD_URL } from './Project1.jsx'

describe('pbix download link', () => {
  it('points at a GitHub Release asset, not a raw repo file', () => {
    expect(PBIX_DOWNLOAD_URL).toMatch(
      /^https:\/\/github\.com\/GPham62\/bio-data-page\/releases\/download\/.+\.pbix$/)
    expect(PBIX_DOWNLOAD_URL).not.toContain('/raw/')
  })
})
```

Run: `npm test -- p1Download` → FAIL (const not exported yet).

- [ ] **Step 2:** Add the const, replace the `href="https://github.com/GPham62/bio-data-page/raw/main/powerbi/p1/p1.pbix"` at line 422 with `href={PBIX_DOWNLOAD_URL}`.
- [ ] **Step 3:** `npm test -- p1Download` → PASS. Full `npm test` → PASS.
- [ ] **Step 4: Sync `DAX_SNIPPET`** — compare the const in `Project1.jsx` against the final validated `Skill Premium ($)` DAX from Task 6; if drifted, paste the validated version (code is not localized — no locale change).
- [ ] **Step 5:** `npm run build` → succeeds.
- [ ] **Step 6: UX audit** — dispatch the `portfolio-ux-auditor` agent on Project 1 section 08 (both themes, both locales) per standing user preference; fix anything it flags on the changed section.
- [ ] **Step 7: Commit** (`git commit -m "feat(p1-web): release download link + dax snippet sync"`).

---

### Task 15: Wrap-up

- [ ] **Step 1:** `git log --oneline main..worktree-p1-role-comparison-rework | head -30` — confirm all commits present.
- [ ] **Step 2:** Report to user: branch ready; merging to main auto-deploys to Vercel — merge is the USER'S decision (branch previously declared unfinished; this may finish it — ask).

## Self-review notes

- Spec coverage: format/tooling→T1-2, model→T3-7, theme/pages→T8-11, screenshots→T12, release/hosting→T13, web+i18n+tests→T14. Drill de-templating fixes: platform cleaning T3, labeled avg tick T11 (gauge titles), windowed gauges T7, meaningful donut legends T3 columns, dark theme T8.
- PBIR JSON is deliberately not inlined: the authoring skill forbids writing visual JSON from memory; each visual row carries exact fields/positions and the reference file + capability-lookup procedure instead.
- Known runtime risks called out inline: error-bar support (T9 fallback), map geocoding (T11 fallback), Jaccard TOPN ties (T6 tolerance).
