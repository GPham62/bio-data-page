# Ubiquitous Language — Data Portfolio

> Every term in this file is the **canonical name** for its concept.
> Using a synonym anywhere — code, conversation, PR title, comment — is a signal
> that the domain model needs repair. When in doubt, use this file.

---

## Project
**Means:** A complete, end-to-end data analysis case study the author built and shipped.
**In code:** `src/pages/Project1.jsx`, `Project2.jsx`, `Project3.jsx` · `App.jsx › active === 'p1'`
**Banned aliases:** `card` (used as iterator variable in `PROJECTS.map(card =>`), `portfolio` (CSS prefix `portfolioCard`, `portfolioGrid`), `cards` (locale namespace `home.cards.*`)
**Context:** Portfolio

---

## Page
**Means:** A top-level view that fills the main content column — the unit of navigation.
**In code:** `src/pages/*.jsx` · `App.jsx › active` state (`'home' | 'p1' | 'p2' | 'p3' | 'resume'`) · `setActive(id)`
**Banned aliases:** `route` (no such identifier exists, but used colloquially)
**Context:** Portfolio

---

## Section
**Means:** A self-contained content block that lives inside a Page, separated by a heading and subtitle.
**In code:** `<section className={styles.section}>` in `Home.jsx` · `SectionTitle` component
**Banned aliases:** none — but see **Drift #4**: some sections break the naming convention
**Context:** Portfolio

---

## Kicker
**Means:** A short monospace label rendered above a heading to set context — always styled in `var(--mono)` and `var(--accent-blue)`.
**In code:** `styles.greetKicker`, `styles.portfolioKicker` · locale keys `home.greeting.kicker`, `home.contact.kicker`, `resume.kicker`
**Banned aliases:** `label` (used for other concepts), `subtitle` (that is `sub`)
**Context:** Portfolio

---

## Badge
**Means:** A small status pill that declares the live state of a Project — either `Live` or `WIP`.
**In code:** `styles.badgeLive`, `styles.badgeWip` · locale keys `home.badge_live`, `home.badge_wip`
**Banned aliases:** `tag` (different concept — see **Tag**)
**Context:** Portfolio

---

## Tag
**Means:** A small pill that names a technology or method associated with a Project or Skill.
**In code:** `styles.portfolioTag`, `styles.skillTag` · locale arrays `home.cards.p1.tags`, `home.whatIDo.items[].skills`
**Banned aliases:** `badge` (different concept — see **Badge**), `chip`, `pill`
**Note:** `portfolioTag` and `skillTag` are the same visual concept applied in two contexts; prefer a single `.tag` class and differentiate by color if needed.
**Context:** Portfolio

---

## Hint
**Means:** A small inline prompt that tells the visitor what to do next (e.g. "open →", "coming soon").
**In code:** `styles.enterHint` · locale keys `home.open_hint`, `home.soon_hint`
**Banned aliases:** `cta` (a CTA is a button with a destination; a Hint is passive text)
**Note (Drift #5):** CSS says `enterHint`; locale says `open_hint` — canonical name is **Hint**, so CSS class should become `hint`.
**Context:** Portfolio

---

## Insight
**Means:** A highlighted, prose data finding within a Project — boxed callout that explains what a chart means.
**In code:** locale keys `p1.s1_insight`, `p1.insight_label`, etc. · rendered inline in `Project1/2/3.jsx`
**Banned aliases:** `note` (used separately for explanatory footnotes — `note_retention`, `note_bootstrap`), `finding`
**Context:** Project Analysis

---

## KPI
**Means:** A single headline metric displayed at the top of a Project page — a number with a label and sub-label.
**In code:** `src/components/StatCard.jsx` (the component) · locale keys `p1.kpi_postings`, `p1.kpi_median`, etc.
**Banned aliases:** `stat` (the component is named `StatCard` — see **Drift #6**), `metric`
**Context:** Project Analysis

---

## Chart
**Means:** A data visualisation rendered via Recharts, wrapped in a titled container.
**In code:** `src/components/ChartCard.jsx` (the container component) · locale keys `p1.chart_salary`, etc.
**Banned aliases:** `graph`, `viz`, `visualisation` (unless referring to the discipline)
**Context:** Project Analysis

---

## Theme
**Means:** The active visual mode of the site — either `dark` or `light`.
**In code:** `Sidebar.jsx › theme` state · `localStorage.getItem('theme')` · `data-theme` attribute on `<html>`
**Banned aliases:** `mode`, `colorScheme`
**Context:** Portfolio

---

## Locale
**Means:** The active display language — either `en` (English) or `vi` (Vietnamese).
**In code:** `src/locales/en.json`, `vi.json` · `i18n.language` · `localStorage.setItem('lang', …)`
**Banned aliases:** `language` (i18next API name — acceptable internally but prefer `locale` in our own identifiers), `lang` (shorthand used in localStorage key and `toggleLang` — see **Drift #3**)
**Context:** Portfolio

---

## Game
**Means:** A mobile game the author shipped to Google Play — listed in the About section.
**In code:** `Home.jsx › GAMES[]` · `styles.gameCard`, `styles.gameName`, `styles.gameGenre` · locale key `home.about.games_label`
**Banned aliases:** none
**Context:** Portfolio / Biography

---

## Skill
**Means:** A technical tool or method the author is proficient in, listed inside a Capability card.
**In code:** `home.whatIDo.items[].skills[]` · `styles.skillTag`, `styles.skillRow`
**Banned aliases:** `technology`, `tool`, `stack`
**Context:** Portfolio

---

## Pivot
**Means:** The career transition narrative — the story of switching from game development to data analysis.
**In code:** `styles.pivotBox`, `styles.pivotLabel`, `styles.pivotText` · locale keys `home.about.pivot_label`, `home.about.pivot_text`
**Banned aliases:** `transition`, `career_switch`
**Context:** Portfolio / Biography

---

## StatCard
**Means:** The shared UI component that renders a single KPI — a value, a label, and an optional sub-label.
**In code:** `src/components/StatCard.jsx`
**Note:** The component name is `StatCard` but the domain concept it represents is **KPI**. The component name is fine as an implementation detail; use **KPI** in all domain conversation.
**Context:** Portfolio UI

---

## ChartCard
**Means:** The shared UI component that wraps a Recharts chart with a title and sub-label.
**In code:** `src/components/ChartCard.jsx`
**Note:** Implementation name. Domain concept is **Chart**.
**Context:** Portfolio UI

---

&nbsp;

# Project Analysis — Domain Concepts

These are the analytical terms specific to each case study. They are a distinct
**bounded context** from the Portfolio UI above: here `Project` means the *subject* of
analysis, not a card on the home page.

## A/B Test
**Means:** A controlled experiment comparing two variants of a game to measure which retains players better — the Cookie Cats study (Project 2).
**In code:** `src/data/project2.js` · `sql/project2/` · locale namespace `p2.*`
**Banned aliases:** `experiment` (acceptable as plain prose, but the canonical noun is **A/B Test**), `split test`
**Context:** Project Analysis

## Gate
**Means:** The progression checkpoint where players must wait or pay — the experiment's treatment variable, placed at either level 30 or level 40.
**In code:** `gate_30` / `gate_40` (the two variants) · `groupSizes` · `sql/project2/01_retention_by_gate.sql`, `02_engagement_by_gate.sql`
**Banned aliases:** `group`, `variant`, `arm`, `cohort` (a Gate is the *treatment*; **Cohort** is a time-based group — keep them separate)
**Context:** Project Analysis

## Retention
**Means:** The share of players who return to the game N days after install — measured at day 1 and day 7.
**In code:** `retention1Data` / `retention7Data` (D1 / D7) · `sql/project2/01_retention_by_gate.sql`
**Banned aliases:** `return rate`, `stickiness`. Note: in **Cohort** analysis (Project 3) the same idea is the per-month `m0…m12` values — same concept, different context.
**Context:** Project Analysis

## Bootstrap
**Means:** Resampling the data many times to estimate a confidence interval for the retention difference between gates.
**In code:** `bootstrapMeanDiff`, `bootstrapCILow`, `bootstrapCIHigh`, `bootstrapData` · locale `note_bootstrap`
**Banned aliases:** `resample`, `simulation`. The interval itself is the **CI** (confidence interval) — keep `CI` for the interval, `Bootstrap` for the method.
**Context:** Project Analysis

## RFM
**Means:** A customer-scoring method ranking each customer by **R**ecency, **F**requency, and **M**onetary value — the e-commerce study (Project 3).
**In code:** `rfmSegments`, `rfmScatter` (fields `recency`, `frequency`, `monetary`) · `sql/project3/01_rfm_scoring.sql`
**Banned aliases:** `customer scoring`, `RFM model`. Spell the axes out as `recency` / `frequency` / `monetary` — never `r` / `f` / `m`.
**Context:** Project Analysis

## Segment
**Means:** A named group of customers sharing an RFM profile — `Champions`, `Loyal`, `Potential Loyal`, `At Risk`, `Hibernating`, `Lost`.
**In code:** `rfmSegments[].segment` · `sql/project3/02_segment_revenue.sql`
**Banned aliases:** `tier`, `bucket`, `group`, `cluster`. The entity being segmented is a **Customer** (not `user`/`player` — that is Project 2's vocabulary).
**Context:** Project Analysis

## Cohort
**Means:** Customers grouped by the month they first purchased, tracked across subsequent months to measure repeat-purchase retention.
**In code:** `cohortData` (fields `cohort`, `m0…m12`) · `CohortHeatmap.jsx` · `sql/project3/03_cohort_retention.sql` · locale `p3.cohort_label`
**Banned aliases:** `group`, `batch`, `generation`. A **Cohort** is time-based — do not call a **Gate** group or an RFM **Segment** a "cohort".
**Context:** Project Analysis

---

&nbsp;

# Drift Register

Places where the codebase currently uses a term other than the canonical one.
**Most of the prior register has been resolved** since the last scan — only #7 (partial) remains.

| # | File / Location | Current term | Canonical term | Action | Status |
|---|---|---|---|---|---|
| 1 | `Home.jsx` | `PROJECTS.map(card =>` | **Project** | Rename iterator → `project` | ✅ Fixed |
| 2 | `Home.module.css` | `portfolio*` classes | `project*` | Rename CSS classes | ✅ Fixed (no `portfolio*` classes remain) |
| 3 | `en.json` / `vi.json` | `home.cards.*` | `home.projects.*` | Rename namespace | ✅ Fixed (now `home.projects`) |
| 4 | `Home.module.css` | `greetSection`, `contactSection` | `section` + modifier | Use `.section`; page overrides via modifier | ✅ Fixed |
| 5 | `Home.module.css` | `enterHint` | `hint` | Rename class | ✅ Fixed (`.hint`) |
| 6 | `en.json` | `kpi_*` vs `StatCard` | **KPI** | Component name is impl detail | ✅ OK as-is |
| 7 | `Sidebar.jsx:14,89,91` | `isVI` | **Locale** | `toggleLang`→`toggleLocale` & key `'lang'`→`'locale'` already done; `isVI` still hardcodes Vietnamese into a boolean | ⚠️ **Open** — see below |
| 8 | `en.json` | dead `home.cards.p1.role` | (removed) | Drop dead key | ✅ Fixed (the surviving `role:"Junior Data Analyst"` at `en.json:9` is the live hero/identity role, not the dead card key) |

## Remaining rename recommendation (not yet applied)

**Drift #7 — `isVI` in `src/components/Sidebar.jsx`**
- `const isVI = i18n.language === 'vi'` (line 14), used at lines 89 & 91.
- Canonical concept is **Locale**, a two-valued thing (`en` | `vi`). A boolean named for one specific value bakes the Vietnamese branch into the identifier.
- **Recommended rename:** `isVI` → `isVietnamese` (clearer), or better, drop the boolean and compare `locale === 'vi'` inline at the two use sites. Low priority, cosmetic — the localStorage key and toggle verb are already canonical.

Confirm if you want this applied; it's the only live rename left.

---

*Generated by `/ubiquitous-language` scan — update this file whenever a new domain concept is introduced.*
