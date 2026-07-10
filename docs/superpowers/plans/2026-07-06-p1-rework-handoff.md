# HANDOFF — Project 1 Role-Comparison Rework + Power BI

**Resume with:** "Execute `docs/superpowers/plans/2026-07-06-p1-role-comparison-rework.md` using superpowers:subagent-driven-development, starting at Task 1."

## What happened this session

1. Grill-me session produced a signed-off decision log (all decisions final, do not re-litigate).
2. Full implementation plan written to `docs/superpowers/plans/2026-07-06-p1-role-comparison-rework.md` (13 tasks, complete code + locale strings + PBI runbook).
3. **Nothing implemented yet.** Repo is clean on `main` at 06f4251 (plus these two docs, uncommitted).

## The decisions (condensed — full log rationale lives in the plan header + this list)

- **Pivot:** Project 1 goes from descriptive charts → role comparison: "which data career should a game dev switch into?"
- **Roles:** Data Analyst, Business Analyst, Data Engineer, Data Scientist + Software Engineer baseline. Seniors only as growth-ladder view.
- **Hero:** "1.6M job ads. 5 careers. 1 switch." + fighting-game character-select strip (5 role cards: name, median salary, badge).
- **8 web sections:** 01 contenders (salary median+IQR, demand small multiples) · 02 entry barriers (junior door, degree penalty, confounder note) · 03 transition map (5×5 Jaccard heatmap) · 04 skill ROI quadrant (DA, mid-level only) · 05 ML model (kept, reframed) · 06 Vietnam callout card (n-counts, no chart) · 07 verdict table (6 axes, two-step verdict: DA = entry door, DE = growth destination) · 08 Power BI exposure (2 screenshots + .pbix raw download + DAX snippet card).
- **Power BI:** 2 pages ("The Face-Off" + "Switching Costs"), role slicer, PBI-native. Hybrid math: 7 hand-written DAX measures + Python-precomputed CSVs (Jaccard, skill premiums). **Guided build — user drives Desktop, Claude instructs (plan Task 12 runbook). Not a subagent task.**
- **Ship order:** pipeline → web → live PBI session → push to main (Vercel auto-deploys).

## Verified data findings (already computed from `powerbi/p1/project1_data/`, quote confidently)

- Salary window $10K–$600K yearly; ~40K salary records across the 5 roles.
- Mid-level medians: DE $125K > DS $121.5K > SE $118.75K > BA $89.1K > DA $87.7K.
- **Degree penalty (level-controlled, mid):** DS −$25K, SE −$25K, DA −$378 (≈zero). Raw SE "+$22K no-degree premium" was a seniority confounder — senior postings drop degree requirements (senior SE no-degree +$28K).
- **Remote premium exists only at senior level:** senior SE +$33.5K, senior DA +$26K, senior DS +$21.75K; mid-level ≈ flat/negative.
- **Junior share:** DA 7.7% > DS 6.6% > BA 5.1% > DE 3.4% > SE 3.3%.
- **Skills per posting (median):** DA/BA 3, DS/SE 5, DE 6.
- **Jaccard top-15 skill overlap:** DA↔BA 0.88, DA↔DS 0.43, DS↔DE 0.36, DE↔SE 0.30, DS↔SE 0.25, DA↔DE 0.20, DA↔SE 0.20, BA↔SE 0.15.
- **Python premium inside mid-level DA postings:** +$13K (~+15%); BA +$13K too.
- **Vietnam postings:** DE 1,608 > DS 790 > DA 762 > SE 465 > BA 145 (BA too thin — state n, don't chart).
- Seniority regex (use everywhere): senior `senior|sr[. ]|staff|principal|lead`; junior `junior|jr[. ]|entry|intern|graduate|trainee`; else mid.

## Environment notes

- Windows: run data probes with `python -X utf8` (cp1252 crashes on unicode).
- i18n rule: en.json + vi.json always updated together (CLAUDE.md). Locale checker: `python -X utf8 _check_locales.py`.
- Role colors: DA `#00e5ff`, BA `#a371f7`, DE `#00cc96`, DS `#ff6b35`, SE `#636e7b`.
- Power BI MCP: `mcp__powerbi__connect_powerbi` (Desktop must be open with p1.pbix) — needed only for Task 12.
- Tests `npm test` (vitest), build `npm run build`, deploy = push to main.
