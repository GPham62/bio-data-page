# P5 Two-Track Handoff — BLUF Synthesis + Cloud Pipeline

Two parallel treehouse-worktree tracks came out of a `/data-analyst-expert`
review of Project 5. Both are now at **plan-approved, implementation-not-started**.
This doc is what a fresh session needs to pick either one back up — the
background agents that wrote these plans belong to the session that spawned
them and cannot be resumed by name/id in a new session; treat their output
(the committed spec + plan docs) as the full handoff, not the agents
themselves.

## Track A — P5 chart cleanup / BLUF synthesis

- **Worktree:** `C:\Users\ADMIN\.treehouse\portfolio-9db2c9\2\portfolio`
- **Branch:** `p5-chart-bluf`
- **Docs (committed on that branch):**
  - `docs/superpowers/specs/2026-07-27-p5-bluf-synthesis-design.md`
  - `docs/superpowers/plans/2026-07-27-p5-bluf-synthesis.md` (8 tasks)
- **What it does:** cuts the standalone rating-histogram section, demotes
  its chart into a new closing synthesis section (placed after section 04,
  not BLUF-first — sections 02-04 keep their numbering/locale keys
  unchanged), replaces the review-level `drag` headline with a new
  restaurant-level `complaintReach` metric ("N restaurants have `<category>`
  as their #1 complaint"), makes the section-03 anecdote dynamic, and fixes
  7 hardcoded dataset-size numbers across `en.json`/`vi.json`.

**Blocking dependency — still open:** Tasks 6-8 need the Task 5 notebook
cell's output (restaurant-level complaint reach). The handoff doc for
getting this out of Colab is `docs/superpowers/plans/2026-07-27-p5-task5-colab-handoff.md`
— paste that into the Claude-for-Colab extension in the tab with
`project5_analysis.ipynb` open, it runs the cell and reports back three
printed values. Paste those into the session so Task 6 (regenerate
`project5.js` with the `complaintReach` export) can proceed. Tasks 1-5 and 7
are already fully codeable against fixtures without this.

**Two plan-doc fixes reviewed but NOT yet applied or sent** (surfaced during
review, never confirmed back to the agent before this session ended):
1. `pickTopByShare` (Task 3, `src/utils/project5Synthesis.js`) has no
   empty-array guard — bare `.reduce()` throws on an empty `complaints`
   array. `pickTopByDrag`, `pickMaxGapPair`, and `pickTopByReach` all return
   `null` on empty input; `pickTopByShare` should match that pattern.
2. Task 7's JSX (`src/pages/Project5.jsx`, new section 05) accesses
   `topByReach.category` / `topByReach.nRestaurants` directly with no null
   check, but `pickTopByReach` can return `null`. `topByDrag` two lines
   below gets the null-safe ternary treatment; `topByReach` needs the same.

Apply both when implementing Task 3/Task 7 — don't skip them, they're real
crash bugs for a small-enough future dataset, which is exactly the scale-up
scenario this whole plan exists to survive.

## Track B — Google Cloud pipeline (GCS -> BigQuery/dbt -> Looker Studio)

- **Worktree:** `C:\Users\ADMIN\.treehouse\portfolio-9db2c9\3\portfolio`
- **Branch:** `p5-google-pipeline`
- **Docs (committed on that branch):**
  - `docs/superpowers/specs/2026-07-27-p5-cloud-pipeline-design.md`
  - `docs/superpowers/plans/2026-07-27-p5-cloud-pipeline.md` (10 tasks)
- **What it does:** rebuilds all six `project5.js` aggregates as a real
  cloud pipeline in a **new public repo** (`p5-cloud-pipeline`, sibling to
  `ShopeeFoodCollector`) — hive-partitioned GCS landing zone, BigQuery
  external tables, dbt staging + mart models (dynamic `GROUP BY`s, no
  hardcoded categories/thresholds), seed fixtures of the current published
  numbers, singular tests cross-validating every mart against those seeds,
  a manual refresh script + scheduled GitHub Actions workflow (WIF auth,
  soft-fail freshness, Slack alerting, dev/prod dataset separation), a live
  Looker Studio dashboard, and a small linking section on `Project5.jsx`
  (both locales) pointing at the repo/dashboard/dbt docs.

**Both review fixes applied and committed** — confirmed in the plan doc:
1. Task 4/Task 6: `mart_by_category.sql` now uses exact `PERCENTILE_CONT`
   window functions for `median_price`/`median_rating` instead of
   `APPROX_QUANTILES`, and the cross-check test compares `median_price`
   with a >1 VND tolerance instead of exact equality — consistent with
   every other column in that test.
2. Task 9's duplicate "Step 2" is renumbered — public-sharing step is now
   Step 3, subsequent steps bumped accordingly.

**No blocking dependency** — this track is fully implementation-ready. It
needs manual one-time GCP
console setup from the user (free-tier project, GCS bucket, BigQuery
datasets, WIF, Slack webhook, billing alert) — documented in the plan's
Task 8 `SETUP.md` — before any `dbt run` against real BigQuery can happen;
Tasks 1 (loader) and its unit test, and Task 5 (seeds), don't need GCP
access to write and test.

## How to resume in a new session

1. `git worktree list` to confirm both worktrees are still leased/present at
   the paths above (see `treehouse-worktree-tool` memory if `treehouse` PATH
   looks broken — it isn't, reload PATH per that memory's instructions).
2. For Track A: if the Task 5 notebook output has been pasted by the user,
   apply the two `project5Synthesis.js` fixes above, then run
   `superpowers:subagent-driven-development` (or `executing-plans`) against
   `docs/superpowers/plans/2026-07-27-p5-bluf-synthesis.md` inside that
   worktree. If the output hasn't been pasted yet, that's still the one
   blocking ask for the user.
3. For Track B: confirm the two fixes are in the committed plan doc (or
   apply them), confirm GCP one-time setup status with the user, then run
   `superpowers:subagent-driven-development` (or `executing-plans`) against
   `docs/superpowers/plans/2026-07-27-p5-cloud-pipeline.md` inside that
   worktree.
4. Both tracks can run as background agents side by side again, same
   pattern as this session: `Agent` tool to launch each fresh (they will
   not have memory of the brainstorm — point them at their plan doc, which
   is self-contained), `SendMessage` only for follow-ups within the *same*
   session that launched them.
5. Standing rules that apply to both tracks' implementation: i18n parity
   (`en.json`/`vi.json` updated together, same response), Vitest tests
   written before pushing, `portfolio-ux-auditor` run on any visual change
   in both themes/locales, never automate Colab (paste-based handoff only).
