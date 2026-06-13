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
- Card carousel of 4 cards driven by `CARDS` (`bio`/00, `p1`/01, `p2`/02, `p3`/03); `p1`–`p3` show a `live` badge.
- Navigation: arrow keys (←/→), wheel/trackpad scroll (700ms throttle), arrow buttons, and dot indicators. Swipes are locked for 550ms via `locked` ref.
- Blurred GIF background per card (`/gif_import/<id>.gif`), cross-fades on change; all GIFs preloaded on mount.
- Clicking the centered card calls `setActive(card.id)` to open that page; side cards re-center.
- Copy comes from i18n keys `home.cards.<id>.{title,role,desc,tags}`, `home.badge_live`, `home.badge_wip`, `home.open_hint`.

**To fix**
- [ ]
- [ ]
- [ ]

---

## Project 2 — Biography (`src/pages/Biography.jsx` + `Biography.module.css`)

**Current state**
- Prev/next buttons → Home / Project 01.
- Hero: tag, two-line title (`bio.title1` + accented `bio.title2`), intro, and avatar `/bio/profile.png`.
- Section 01 — Technical Skills: pills rendered from the `bio.skills` array.
- Section 02 — Background: pivot box with text, then a 3-card game grid linking to **Relic Bag: Shadow Hunter**, **Shadow War: Idle RPG Survival**, **Stickman vs Monster: Idle RPG**, **Epic Shadow Idle RPG**, and **Space War Idle RPG** on Google Play (purple-accented `.gameCard` style).
- Section 03 — Contact: GitHub (`GPham62`), LinkedIn (`pham-tuan-anh`), email (`mailto:phamtuananh6200@gmail.com`).
- Note: email handle shown here (`phamtuananh6200`) differs from the account email in project config (`ptuananh196@gmail.com`) — confirm which is intended.
- Copy comes from i18n keys under `bio.*` and `nav.*`.

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
- Section 04 — ML: **binary classifier** (Gradient Boosting) — Accuracy/ROC-AUC/F1/Baseline score tiles, feature-impact bar (green = pushes high pay, red = pushes low pay), `ml_note` via `dangerouslySetInnerHTML`, and insight. Target = high pay (above $110K median). Not a regression model.
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

## Project 6 — Coming Soon _(placeholder — keep last)_

**Current state**
- _Empty by default._ This is the continuous-project placeholder that always
  sits at the last index. When the next project is ready, replace this with the
  real project section and add a fresh **Coming Soon** placeholder below it.

**To fix**/
- [ ]
- [ ]
- [ ]
