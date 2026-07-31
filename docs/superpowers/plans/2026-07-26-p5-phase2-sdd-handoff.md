# HANDOFF — P5 Phase 2 SDD execution, resume at Task 4

**Resume with:** "Continue Task 4 of `docs/superpowers/plans/2026-07-25-p5-phase2-analysis.md` using superpowers:subagent-driven-development."

Verified at write time: branch `portfolio-cv-brief-site`, HEAD `e974745538057f7caf0106db84fabcacdb748249`.

## What this is

Phase 2 of P5 (Hanoi delivery ratings analysis) is being executed task-by-task via
`superpowers:subagent-driven-development` against the plan at
`docs/superpowers/plans/2026-07-25-p5-phase2-analysis.md` (6 tasks total). This
doc exists so a new session doesn't need to re-derive state from the conversation
— read the ledger below, it's authoritative.

## Ledger (source of truth — do not re-dispatch completed tasks)

`.superpowers/sdd/2026-07-25-p5-phase2-analysis/progress.md`:

- **Task 1: complete** (commits `13319b9..ecc0a8a`) — notebook loads/dedupes/cleans the snapshot. 3 minors parked, no action needed.
- **Task 2: complete** (commits `ecc0a8a..aa62a53`) — the three structured findings (rating wall, price vs. rating, the two ratings disagree). 1 important fixed inline (added `snapshot_*.json` to `.gitignore`), 1 important adjudicated as a non-issue.
- **Task 3: complete** (commits `aa62a53..e974745`) — complaint taxonomy + review labeling. Review clean, no findings.
- **Task 4: not started.** Brief already extracted to `.superpowers/sdd/2026-07-25-p5-phase2-analysis/task-4-brief.md` — BASE for this task is `e974745`.
- Tasks 5–6: not started.

Workspace directory (briefs, reports, diffs, ledger — all scratch, gitignored):
`.superpowers/sdd/2026-07-25-p5-phase2-analysis/`

## State that matters for Task 4 onward

- **Notebook** `project5_analysis.ipynb` has 15 cells (Tasks 1–3). Task 4 appends more — don't restructure the existing ones.
- **`review_labels.json`** exists at `ShopeeFoodCollector/data/derived/review_labels.json`, 691 entries, schema `{review_id, labels}`, labels drawn from the 7-category taxonomy (`taste, value, wait, delivery, service, cleanliness, ordering`) + `"none"`. Correctly gitignored — confirmed via `git check-ignore`, never commit it.
- **Labeling accuracy figure: 96.7% (58/60)** — this is `stats.labelAccuracy` for Task 4/5's published data block. It's a real number from a second-read validation pass, not a placeholder.
- **No Anthropic API key or `anthropic` package available in this environment.** Task 3's labeling was done by direct human/Claude-Code judgment against the fixed taxonomy, not a live API call — documented honestly in the notebook as a markdown note. Task 4 doesn't need the API either; it consumes `lab` (loaded from the JSON) same as the plan's Task 4 spec expects.
- Per the plan, Task 4 produces `tax` (category aggregates: n, share, mean-with/without, drag) and the full printed JS block that Task 5 pastes into `src/data/project5.js`. Categories under 20 reviews must ship count-only (no `drag` figure) — the plan's guard, don't skip it.

## Process reminders (from the subagent-driven-development skill)

- Fresh implementer subagent per task, model explicitly specified (this session used `sonnet` for both Task 3's implementer and reviewer — matches the judgment level needed for Vietnamese review text).
- Record BASE (`git rev-parse HEAD`) before dispatching, run `scripts/review-package` for the diff, dispatch a task reviewer, and only mark the ledger complete after a clean review (or findings fixed/parked).
- Already on a feature branch (not main) — no worktree needed, matches this session's earlier setup.
- Continuous execution: don't stop between tasks to check in unless BLOCKED or genuinely ambiguous.

## Unrelated but active: new global rule

`C:\Users\ADMIN\.claude\CLAUDE.md` gained rule 5 this session: *"Define verification before starting. Before any non-trivial task, name the concrete check that will prove success... before you start."* Applies automatically to every session on this machine going forward — no action needed, just context if its effect looks unfamiliar.
