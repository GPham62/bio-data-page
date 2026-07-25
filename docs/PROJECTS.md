# Projects

Working checklist, one section per page/project. Each section captures the
**current state** so you can drop concrete fixes under **To fix**. Tick boxes as
you go. Use `/projects <name>` to jump into one.

> Reminder: any user-visible string change must update **both** `src/locales/en.json`
> and `src/locales/vi.json` in the same edit.

> **Writing-style note:** keep all user-facing copy as **friendly and warm as
> possible** — write like a real person talking, not a press release. Favour
> conversational, playful phrasing over stiff/corporate wording. Contractions,
> light humour, and direct address ("you") are encouraged. _e.g._ prefer
> "A new data project is cooking. Just you wait!" over "A new end-to-end data
> project is currently in the works." Apply the same warmth to the Vietnamese
> copy (natural, spoken tone — e.g. "Chờ chút nha!").

> **Continuous-project convention:** the final section is always a **Coming Soon**
> placeholder, kept empty by default. When you add a real project, insert it
> **before** the placeholder and bump the placeholder to the new last index — so
> the portfolio always ends on an "in-progress / more to come" note.

---

## Project 1 — Home (`src/pages/Home.jsx` + `Home.module.css`)

**Current state**
- Single-page CV brief (the old card carousel is gone — its GIF + motion folded into the project grid).
- Sections in order: hero/greeting → `02` Character sheet (skill chips, `former` chips get a `↩`) → `03` Selected projects → `04` About → `05` Games → contact.
- Project grid driven by `PROJECTS = ['p3', 'p1', 'p4', 'p2']` (display order only). The card number comes from `PROJECT_NUM` (`p1`/01, `p2`/02, `p3`/03, `p4`/04), so reordering never desyncs a card from its page's tag.
- `LINKED = { p1: 'p4', p4: 'p1' }` cross-links the pair that share the 1.6M-posting dataset (04 is the warehouse feeding 01's analysis); renders a `⛓` button that opens the other page.
- Thumbnails are `/gif_import/<id>.gif` by default; `THUMB = { p4: 'p4.png' }` overrides p4 to a static PNG (warehouse diagram) rather than hiding PNG bytes under a `.gif` name.
- All four cards render the `home.badge_live` badge unconditionally (no `wip` badge in the grid any more).
- `CERT_URL` gates the Google Data Analytics "Verify" link — the link only renders when it is set, so an unlinked certificate claim never ships.
- Copy comes from i18n keys `home.projects.<id>.{title,desc,tags}`, `home.portfolio.{title,sub,label,link_<id>}`, `home.badge_live`, plus `home.greeting.*`, `home.charSheet.*`, `home.about.*`, `home.games.*`, `home.contact.*`.

**To fix**
- [ ]
- [ ]
- [ ]

---

## Project 2 — Resume (`src/pages/Resume.jsx`) + `public/resume.html`

> The standalone **Biography** page (`Biography.jsx`) has been deleted. Its content now
> lives on Home as sections `04` About, `05` Games, and the contact block — do not
> re-add a `bio.*` section here.

**Canonical contact details** — these are the single source of truth. Any new surface
must match them exactly:
- Email: `ptuananh196@gmail.com`
- LinkedIn: `https://www.linkedin.com/in/tuananhpham6296/` (CV/print surfaces may display it bare as `linkedin.com/in/tuananhpham6296`)
- GitHub: `GPham62`

Currently correct in `Home.jsx`, `Sidebar.jsx`, `public/resume.html`, and
`E:\career-ops\cv.md`; asserted in `Sidebar.test.jsx`.

**To fix**
- [ ]
- [ ]
- [ ]

---

## Project 3 — Project 01 page (`src/pages/Project1.jsx` + `Project1.module.css`)

**Dataset:** sourced via DuckDB / MotherDuck (no Kaggle link).
**Colab notebook:** https://colab.research.google.com/drive/1jLuh6oGoBoDFdXSB7WcCt0wRFnNFsuc-

**Current state**
- Prev/next buttons → Biography / Project 02. Data from `src/data/project1.js`.
- Hero: two tags, title, sub, and a tech-stack pill row (Python, DuckDB, MotherDuck, Pandas, Plotly, Scikit-learn, Google Colab).
- KPI row: 6 `StatCard`s (postings, countries, salary records, median, Accuracy %, top skill).
- Section 01 — Salary: vertical bar (salary by title) + remote-% bar, with insight.
- Section 02 — Trends: dual-axis line chart (postings + remote %), with insight.
- Section 03 — Skills + Geo: top-skills bar + top-countries bar, with insight.
- Section 04 — ML: **regression** (`HistGradientBoosting`) predicting US annual salary (`salary_year_avg`, USD/year, US postings only) — score tiles are R² `0.53` / MAE `$22.3K` / train R² `0.61` / baseline MAE `$36.5K` (CV R² `0.54`), feature-impact bar (green = pushes pay up, red = pushes pay down), `ml_note` via `dangerouslySetInnerHTML`, and insight.
- ML details: 79 features (top-50 skill flags + skill count + ordinal seniority parsed from raw `job_title` + role one-hot + top-10 state dummies + extras + interactions); 31,554 train / 7,889 test. Won a 5-fold CV bake-off vs Linear, Ridge, Random Forest. Restricting to the US + a granular seniority tier lifted test R² from 0.33 → 0.53. Importance = permutation importance (top 12).
- Values in `mlResults` (`src/data/project1.js`) are pasted from the Colab notebook (Section 10) — re-run it to update them.
- Recharts custom `Tip` tooltip; `fmt`/`fmtUSD` axis formatters. Insight blocks use `.insight*` styles (recently resized).

**To fix**
- [ ]
- [ ]
- [ ]

---

## Project 4 — Project 02 page (`src/pages/Project2.jsx` + `Project2.module.css`)

**Kaggle dataset:** https://www.kaggle.com/datasets/mursideyarkin/mobile-games-ab-testing-cookie-cats
**Colab notebook:** https://colab.research.google.com/drive/15A4qz4yaRjBL-G__NavQPTf9eWeeAg9S

**Current state**
- Prev/next buttons → Project 01 / Project 03. Data from `src/data/project2.js`.
- Hero: two tags, title, sub, tech-stack pills (Python, Pandas, SciPy, NumPy, Bootstrap Testing, Chi-Square).
- KPI row: 4 `StatCard`s (players, retention-1, retention-7, p-value).
- Section 01 — Experiment Design: group-sizes bar chart, with insight.
- Section 02 — Retention: ret-1 bar (`domain={[42,46]}`) + ret-7 bar (`domain={[17,20]}`) — note the clipped y-axis domains, with insight.
- Section 03 — Bootstrap: area chart of the difference distribution with a `ReferenceLine` at x=0, with insight.
- Section 04 — Game Rounds: grouped bar (Gate 30 vs Gate 40), with insight.
- Conclusion block (`p2.conclusion_title` / `p2.conclusion_text`).
- Recharts custom `Tip` tooltip; `fmt` axis formatter. Insight blocks use `.insight*` styles (recently resized).

**To fix**
- [ ]
- [ ]
- [ ]

---

## Project 5 — Project 03 page (`src/pages/Project3.jsx` + `Project3.module.css`)

**Kaggle dataset:** https://www.kaggle.com/datasets/carrie1/ecommerce-data
**Colab notebook:** https://colab.research.google.com/drive/1-vCUdEub3nRus2PkR2jQZf8hHn3_zMVQ

**Current state**
- Prev/next buttons → Project 02 / Home. Data from `src/data/project3.js`.
- Hero: two tags, title, sub, tech-stack pills (SQL, Python, Pandas, Recharts, RFM Analysis, Cohort Analysis).
- KPI row: 6 `StatCard`s (transactions 542K, customers 4,372, revenue $8.9M, AOV $19.86, return rate 2.2%, top country UK).
- Section 01 — Revenue Overview: monthly-revenue line chart + top-countries-by-revenue bar, with insight.
- Section 02 — RFM Segmentation: RFM scatter (recency × frequency, bubble size = monetary, colour-coded by segment via `SEGMENT_COLORS`) + segment-count bar; custom `ScatterTip` tooltip, with insight.
- Section 03 — Cohort Analysis: custom `CohortHeatmap` component (monthly retention % grid, colour-graded by `getColor`), with insight.
- Section 04 — Recommendations: `recsBox` numbered list from the `p3.recs_items` array.
- Recharts `Tip` + `ScatterTip` tooltips; `fmt`/`fmtUSD` formatters. Insight blocks use `.insight*` styles.

**To fix**
- [ ]
- [ ]
- [ ]

---

## Project 6 — Project 04 page (`src/pages/Project4.jsx` + `Project4.module.css`)

**Recruitment Data Warehouse** — the ELT pipeline behind Project 01. The two are one
system on the same 1.6M-posting dataset (04 builds the warehouse, 01 analyses it), and
the Home grid cross-links them via `LINKED`.

**SQL source:** https://github.com/GPham62/bio-data-page/tree/main/sql/project1
**Raw CSVs:** https://storage.googleapis.com/sql_de/ (loaded by `02_load_data.sql`)

**Current state**
- Data from `src/data/project4.js` (unit-tested in `src/data/project4.test.js`).
- KPI row: 1.6M postings, 4 source CSVs, 18 tables, 5 schemas, 4 marts.
- Section 01 — schema sizes bar (`company_mart` 8, `source` 4, `skills_mart` 3, `priority_mart` 2, `flat_mart` 1) + the `02_load_data.sql` snippet.
- Section 02 — star schema: 4 source tables — `job_postings_fact` (fact), `company_dim` / `skills_dim` (dims), `skills_job_dim` (bridge).
- Section 03 — the 4 marts, each with grain + refresh strategy, plus a merge-SQL snippet:
  - `flat_mart` — one row per job posting — rebuild (`03_flat_mart.sql`)
  - `skills_mart` — one row per skill per month — rebuild (`04_skills_mart.sql`)
  - `priority_mart` — one row per tracked job posting — **incremental** (`06_priority_mart_update.sql`)
  - `company_mart` — one row per company per month — rebuild (`07_company_mart.sql`)
- Copy comes from i18n keys under `p4.*`.
- **Table count is code-backed:** the 18 total is counted from `CREATE TABLE` statements
  (see the header comment in `project4.js`, counted 2026-07-20). If the pipeline gains a
  table, update `project4.js`, the KPI, and `E:\career-ops\cv.md` together.

**To fix**
- [ ]
- [ ]
- [ ]

---

## Project 7 — Coming Soon _(placeholder — keep last)_

**Current state**
- _Empty by default._ This is the continuous-project placeholder that always
  sits at the last index. When the next project is ready, replace this with the
  real project section and add a fresh **Coming Soon** placeholder below it.

**To fix**/
- [ ]
- [ ]
- [ ]
