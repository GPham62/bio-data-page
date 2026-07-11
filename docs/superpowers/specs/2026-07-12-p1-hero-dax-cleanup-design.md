# P1 Hero Cleanup + DAX Card Merge — Design Spec

**Date:** 2026-07-12
**Scope:** Web Project 1 page only (`src/pages/Project1.jsx`). The Power BI report is not touched. Project 2/3 heroes are not touched.

## Problem

The top of the Project 1 page stacks two separate "card walls" before any content: hero text + 9 tech pills, then 5 role cards (RoleSelectStrip), a hint line, 2 bordered link buttons (Python/SQL), then a second wall of 6 KPI StatCards. Three of the six KPIs (7.6% junior share, 0.88 R², +$12K skill premium) duplicate numbers that already appear in sections 02, 05, and 04.

The Skill Premium DAX card sits in section 08 next to the dashboard screenshots, but its title says it is "the DAX behind the Skill ROI chart" — a chart that lives in section 04, which already has its own SQL card. The DAX card is orphaned and creates a second code block far from the thing it explains.

## Decisions (user-approved)

1. **Hero: one card wall.** The role strip is the hero's only card moment.
2. **DAX merges into the section 04 code card** as a second tab. Section 08 becomes purely visual.

## Design

### 1. Hero

- Delete the `kpiRow` section (6 StatCards) from `Project1.jsx`.
- Add a slim one-line stat strip inside the hero, after the tech pills:
  `1.6M postings · 40K salary records · 5 countries`
  Muted text, accent-colored numbers, no card boxes. New CSS class in `Project1.module.css`.
- Merge the hint line and the links into one flex row: hint text left ("5 roles. Scroll to see who wins."), `Python ↗ · SQL ↗` as small text links right. `flex-wrap` for mobile. The old `.linkRow` bordered-button styles for these two links are removed.
- Remove dead locale keys from **both** `en.json` and `vi.json`: the labels/subs for the three cut KPIs (`kpi_median`, `kpi_r2`, `kpi_skill` and their `_sub` variants). Keep `kpi_postings`, `kpi_salary_rec`, `kpi_countries` label keys (reused by the stat strip). Their `_sub` keys are removed — the strip shows value + label only.

### 2. Tabbed code card (section 04)

- `SqlCard` gains an optional `tabs` prop: array of `{ label, code, href, linkLabel }`.
  - Without `tabs`, the component behaves exactly as today (P2/P3 untouched).
  - With `tabs`, the header shows tab buttons (`<button>`, keyboard accessible); the active tab drives the code block and the header link.
- Section 04 card: tab **SQL** = current skill-ROI query, link "View SQL Queries" → `sqlUrl`; tab **DAX** = Skill Premium ($) snippet, link "Download the .pbix" → `PBIX_DOWNLOAD_URL`.
- Tab labels "SQL"/"DAX" are technical acronyms, identical in both locales — no new locale keys for the labels themselves.

### 3. Section 08

- Two dashboard screenshots stay as-is (ChartCards with full-res links).
- The SqlCard is removed from section 08.
- A single centered "Download the .pbix" button below the screenshots, reusing the accent-bordered link style introduced in the contrast fix (`dash_download` locale key, unchanged).
- Duplicate CTA with the DAX tab is intentional: a CTA at the point of relevance.

### 4. Tests & verification

- New Vitest spec: SqlCard with `tabs` — renders tab buttons, switching swaps code and header link; without `tabs`, legacy rendering unchanged.
- Locale parity test stays green after key removals.
- `p1Download.test.js` unchanged (`PBIX_DOWNLOAD_URL` untouched).
- Post-implementation: portfolio-ux-auditor pass on Project 1 page, both themes and both locales.

## Out of scope

- Power BI report canvas (all 3 pages).
- Project 2/3 hero link styling.
- Any change to the .pbix release or download URL.
