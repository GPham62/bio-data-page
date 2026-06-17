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

# Drift Register

Places where the codebase currently uses a term other than the canonical one.

| # | File / Location | Current term | Canonical term | Action |
|---|---|---|---|---|
| 1 | `Home.jsx:156` | `PROJECTS.map(card =>` | **Project** | Rename iterator: `PROJECTS.map(project =>` |
| 2 | `Home.module.css` | `portfolioCard`, `portfolioGrid`, `portfolioCardTitle`, `portfolioCardDesc`, `portfolioDetails`, `portfolioInfo`, `portfolioKicker`, `portfolioNum`, `portfolioTag`, `portfolioTags`, `portfolioThumb`, `portfolioThumbWrap`, `portfolioTopRow` | `project` prefix | Rename all `portfolio*` CSS classes → `project*` (e.g. `projectCard`, `projectGrid`) |
| 3 | `en.json`, `vi.json` | `home.cards.*` | `home.projects.*` | Rename locale namespace `cards` → `projects` |
| 4 | `Home.module.css` | `greetSection`, `contactSection` | `section` + modifier | Sections should use `.section` class; page-specific layout overrides belong in a modifier or a named block, not a renamed class |
| 5 | `Home.module.css` | `enterHint` | `hint` | Rename class `.enterHint` → `.hint` |
| 6 | `src/locales/en.json` | `kpi_postings`, `kpi_median`, … | Use `kpi` prefix consistently — already doing this ✓ | No change needed; note that the *component* is `StatCard` — that divergence is acceptable as an implementation detail |
| 7 | `Sidebar.jsx` | `toggleLang`, `localStorage.setItem('lang')`, `isVI` | **Locale** | Rename `toggleLang` → `toggleLocale`, localStorage key `'lang'` → `'locale'`, `isVI` → derive from `locale === 'vi'` |
| 8 | `en.json` locale key naming | `home.cards.p1.role` | `.role` not used in UI (replaced by `tags`) — dead key | Remove `role` keys from all cards in both locales |

---

*Generated by `/ubiquitous-language` scan — update this file whenever a new domain concept is introduced.*
