# P1 Power BI Report — Layout & Build Design

**Date:** 2026-07-11
**Status:** approved in brainstorm (visual mockups in `.superpowers/brainstorm/10657-1783716305/content/`, gitignored)
**Supersedes:** the report-page portion of `docs/superpowers/plans/2026-07-07-p1-task12-powerbi-native-handoff.md` (its model/DAX runbook still governs, with the additions below)

## Purpose

Fill the two Power BI placeholder panels on Project 1's web page (section 08) with
self-explanatory, recruiter-facing dashboard screenshots, and offer the full report
as a `.pbix` download. Screenshots must work with zero interaction; the download
carries the full interactive complexity.

## Source format & tooling

- Source of truth is the **PBIP project** the user created (`p1.pbip` + `p1.SemanticModel/` + `p1.Report/`).
- Claude authors everything as code:
  - Model (tables, Power Query M, relationships, measures) via **powerbi-modeling-mcp**, live against Power BI Desktop.
  - Report pages/visuals as **PBIR JSON** via the `powerbi-report-authoring` skill (fabric-collection `powerbi-authoring` plugin v0.3.7).
  - Verify loop via the **powerbi-desktop CLI**: validate → reload → screenshot after each authoring batch.
- PBIP text files (TMDL + PBIR JSON) are committed to git. Data caches (`cache.abf`, `.pbi/`) are gitignored. The old 114.7 MB `p1.pbix` stops being tracked source.
- Manual user steps shrink to: keep Desktop open; export the final `.pbix`.

## Model

Unchanged from the 2026-07-07 handoff: raw star schema import (4 CSVs from
`powerbi/p1/project1_data/`), `Seniority Level` custom column, 3 relationships
(skills bridge Both-direction), 8 measures incl. `Skill Premium ($)` and
`Jaccard Overlap`. Salary window `$10K–$600K` everywhere. Sanity anchors:
DA mid median ≈ $88K, DA↔BA Jaccard ≈ 0.88, Vietnam DE = 1,608.

**Additions for page 3:**

- Power Query: clean `job_via` → strip leading `via ` prefix into a `Job Platform` column (fixes duplicate LinkedIn/BeBee bars seen in the course original).
- Measures: `Remote %`, `Health Insurance %`, `Median Hourly Salary`, `Avg Salary` / `Avg Hourly` (gauge targets). All respect the salary window where salary-based.

## Report — 3 pages, 16:9, light theme

Theme: background `#ffffff`, panel `#f6f8fa`, border `#d0d7de`, text `#1f2328`,
muted `#57606a`. Role colors: DA `#0087a3`, BA `#8250df`, DE `#00996f`,
DS `#e8590c`, SE `#4467a8`. Every page carries a takeaway title + subtitle
(screenshot-first: the page must self-explain as a static image).

### Page 1 — "The Face-Off" (Executive banner layout)

- Title: `THE FACE-OFF — 5 data careers, 1.6M job ads`; subtitle states the two headline findings (DE pays most; DA opens the widest door).
- Chiclet role slicer (`job_title_short`) top-right, default all-selected.
- KPI strip (4 cards): 1.6M postings · 40K salary records · $125K top median (DE) · 7.7% junior door (DA).
- Hero left: median salary bar chart with P25–P75 range, mid-level, 5 roles, role colors, data labels.
- Right: growth-ladder matrix — rows = roles, columns = junior/mid/senior, values = median salary.
- Bottom strip: postings-by-month line/area (demand seasonality).

### Page 2 — "Switching Costs" (single dense page)

- Title: `SWITCHING COSTS — how far is the jump?`; subtitle: DA→BA ≈ free (0.88), Python +$13K.
- Left column: compact Jaccard 5×5 heatmap matrix (do NOT stretch cells; natural height), with **skills-per-posting bar** (DE 6, DS/SE 5, DA/BA 3) directly below it.
- Center: skill-ROI scatter (demand % vs `Skill Premium ($)`, mid-level DA only), capped at top ~10 skills by demand so labels stay legible; axis captions on-canvas.
- Right rail: entry-barriers bars (junior door % for DA/DS/DE + degree gap for DA/DS/SE), Vietnam stat card (5 rows, counts only, "n small" flag on BA).
- Footnote: degree penalty is level-controlled (mid only); raw comparison confounded by seniority.

### Page 3 — "Job Title Drill Through" (adapted from the Luke Barousse course page)

- Drillthrough target on `job_title_short`; reachable from any role visual on pages 1–2; auto back button; dynamic title via `SELECTEDVALUE(job_postings_fact[job_title_short])`.
- Visuals: yearly + hourly salary gauges (median callout, target tick labeled "avg", ranges use the $10K–$600K window; the hourly window is pinned at build time from a data probe, same outlier-trim logic as yearly); three donuts with meaningful legend labels (Remote/On-site, No degree required/Degree required, Insurance/None); "Jobs Globally" map (bubble = posting count, geocode `job_location`); Job Platform bar (cleaned `Job Platform` column); Job Schedule Type treemap.
- Styling: light theme; the drilled role's accent color drives the page's data color.
- Deliberate de-templating vs the course original: cleaned platform bars, labeled gauge targets, windowed gauge ranges, meaningful donut legends, role-accent styling instead of default blue.

## Export, hosting, web integration

- Screenshots: pages 1–2 → `public/p1_dashboard_faceoff.png`, `public/p1_dashboard_switching.png`; they fill the two placeholder panels in Project 1 section 08. Page 3 is download-only (needs drill context; no third placeholder).
- Download: export `.pbix` from Desktop, attach as a **GitHub Release asset** (stable URL, no repo-size limit issue). Web download button links to the release asset and is labeled as a `.pbix` download.
- All new user-facing strings land in `src/locales/en.json` **and** `vi.json` in the same change (CLAUDE.md rule).
- Bonus exposure: PBIP TMDL/DAX is readable source in the repo.

## Verification

- After each PBIR batch: `powerbi-report-author validate` → `powerbi-desktop` reload → screenshot → compare against approved mockups.
- DAX validated against the handoff's sanity anchors before any visual work uses a measure.
- Drillthrough tested by drilling each of the 5 roles; gauges/donuts must repopulate.

## Out of scope

- ML metrics page (metrics live in Colab, not the model).
- Reworking pages beyond these 3; web section 08 structural changes beyond filling placeholders + download link.
- Publishing to Fabric service.
