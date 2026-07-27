# P5 BLUF Synthesis + Locale Number Hygiene — Design

Status: approved by user during brainstorming (2026-07-27). Task 5 notebook output
still pending — synthesis copy text is drafted with clearly marked placeholders
until the real restaurant-count numbers land.

## Problem

Project5.jsx (Hanoi delivery ratings page) currently has 4 chart sections plus a
method/limits section. Each chart section carries its own micro-insight
(`InsightBlock`), but nothing ties the four findings together into one
business-metric-backed conclusion. A reader who sits through all 4 charts still
doesn't know "so what should a restaurant or platform do about this" — there is
no bottom-line-up-front (BLUF), no single number that changes a decision.

Separately: several `p5.*` locale strings hardcode today's dataset size (402
restaurants, 115 reviewed, 337 analysable, 229 taste-complaint reviews, etc.).
The user is going to scale the underlying dataset up, and nothing about this
page may bake in today's N — every number shown must be sourced from computed
aggregates via i18n interpolation (`t('key', {n: ...})`), the same pattern
`method_accuracy_text` already uses with `{{pct}}`.

## Decisions made during brainstorming

1. **Chart 01 (rating histogram)**: cut the standalone section (`SectionTitle
   index="01"`, its own `ChartCard`, its own `InsightBlock`). The KPI row
   already states the skew numerically (`share ≥ 4.5`); a dedicated section
   repeating that is redundant. The chart's *pixels* survive, demoted to a
   small supporting visual embedded inside the new synthesis section — it
   gives the "ratings cluster tight" claim something to point at instead of
   asserting it in bare prose, and it avoids a jarring jump from 4 KPI cards
   straight into a prose-heavy synthesis block with no visual break.

2. **New business-metric conclusion**: restaurant-count based, not
   review-count based. "Which complaint category drags the rating down the
   most" (existing `complaints[].drag`, review-score-scale) is upgraded to
   "how many restaurants does that actually touch" via a new notebook
   aggregate (Task 5, see below) that finds each restaurant's *lead
   complaint category* (the complaint category raised most often across that
   restaurant's own reviews) and counts restaurants per lead category. This
   turns a review-level statistic into a restaurant-level, decision-relevant
   number: "N restaurants have `<category>` as their #1 named problem."

3. **Synthesis section placement**: closing section, not a lead/BLUF-first
   section. Sections 02–04 (price, scatter, complaints) keep their current
   numbering and locale keys — no renumbering, no key churn. The new
   synthesis becomes a new section placed after section 04 and before the
   existing method/limits section (currently section 05, which becomes 06).
   The demoted rating-histogram chart lives inside this new section as a
   supporting visual, with no standalone insight text of its own (the
   section's own InsightBlock covers it).

4. **s3 anecdote generalization**: `s3_insight`'s "a restaurant can hold a
   4.6-star listing and a review average of 4 out of 10" is a specific
   illustrative pair pulled from `ratingPairs`, not a computed stat field. It
   stays as a *dynamic* real example — computed client-side in `Project5.jsx`
   (next to the existing `dragColor` min/max pattern) as "the pair in
   `ratingPairs` with the largest gap between normalized SF rating and Foody
   score," passed to `t()` as interpolation params. No notebook change needed
   since `ratingPairs` is already exported as raw per-restaurant data.

5. **Locale hardcoding audit** (existing strings, not just the new section):

   | Key | Hardcoded today | Fix |
   |---|---|---|
   | `p5.sub` | "402 Hanoi restaurants" | interpolate `stats.restaurants` |
   | `p5.kpi_reviews_sub` | "115 of the 402" | interpolate `stats.reviewedRestaurants` / `stats.restaurants` |
   | `p5.kpi_share45_sub` | "337 restaurants" | interpolate `stats.analysable` |
   | `p5.s1_insight` | dropped along with section 01 (folded into new synthesis copy below) | — |
   | `p5.s2_insight` | "9.2×" / "0.3 stars" | interpolate `stats.priceSpread` / `stats.ratingSpread` |
   | `p5.s3_insight` | "4.6-star" / "4 out of 10" | interpolate the dynamic max-gap pair (decision 4) |
   | `p5.s4_insight` | "229 reviews", "a third", and the category **names** "Cleanliness and delivery" | interpolate `n`/`share` AND the category label itself — sort `complaints` at render time for top-share and top-drag categories (mirrors the existing `dragColor` extremal pattern), pass both the translated label and the numbers as `t()` params. A fixed string naming specific categories cannot survive a re-run where a different category tops the ranking. |
   | `p5.caveats_items[2]` | "115 of the 402" | interpolate same fields as `kpi_reviews_sub` |

   `method_accuracy_text` already does this correctly (`{{pct}}`) — used as
   the reference pattern for every fix above and for the new synthesis
   section's copy.

## New section: "What actually moves the rating" (working title)

Placed after current section 04, before the method/limits section.

- `SectionTitle` with its own index (06 becomes method/limits; this new
  section takes the number directly after 04 — final numbering assigned at
  implementation time once section 01's removal is applied throughout).
- Demoted histogram chart (`ratingHistogram`, same `BarChart` as removed
  section 01) as a compact supporting visual — smaller `ChartCard`, no
  separate `InsightBlock`.
- One synthesis paragraph/`InsightBlock` stating, in order:
  1. The BLUF sentence: `<category>` is the biggest rating drag **and**
     touches the most restaurants (or: whichever category tax makes the
     stronger case once real numbers are in — see placeholders below).
  2. The restaurant-count number from the new Task 5 aggregate.
  3. A one-line recommendation: fixing that category's complaint pattern is
     a bigger lever than price positioning (already established false lead
     in section 02) or platform choice (section 03's weak correlation).
- All numbers interpolated per the pattern above — none hardcoded.

### Placeholder copy (real numbers pending Task 5 output)

> "`{{leadCategory}}` is the single largest lever: it drags the average
> rating down by `{{dragPoints}}` review-score points, and it's the #1 named
> problem for `{{nRestaurants}}` of the `{{nReviewed}}` restaurants with
> reviews — more than price positioning or which review platform a customer
> reads moves the needle. Fixing `{{leadCategory}}` first is where a rating
> recovery plan should start."

`{{leadCategory}}`, `{{dragPoints}}`, `{{nRestaurants}}` are placeholders
until the pasted Task 5 output is in hand; `{{nReviewed}}` already exists as
`stats.reviewedRestaurants`. Exact phrasing will be finalized once the real
winning category and count are known (the ranking-by-restaurant-count winner
may differ from the ranking-by-drag winner — if so, the copy will explicitly
name both and explain the "common vs. costly vs. widespread" distinction,
matching the tone already established in the current `s4_insight`).

## Task 5 notebook cell (already handed to user, reproduced here for the record)

```python
long_r = long.merge(rev[["review_id", "restaurant_id"]], on="review_id")
drag_rank = tax.set_index("category")["drag"].to_dict()

def lead_category(g):
    counts = g["category"].value_counts()
    top_n = counts.max()
    tied = counts[counts == top_n].index.tolist()
    if len(tied) == 1:
        return tied[0]
    return max(tied, key=lambda c: drag_rank.get(c, float("-inf")))

lead = (long_r.groupby("restaurant_id")
              .apply(lead_category)
              .rename("lead_category")
              .reset_index())

reach = (lead["lead_category"].value_counts()
             .rename_axis("category")
             .reset_index(name="n_restaurants")
             .merge(tax[["category", "drag", "n_reviews"]], on="category", how="left")
             .sort_values("n_restaurants", ascending=False))

print(f"reviewed restaurants total: {rev['restaurant_id'].nunique()}")
print(f"restaurants with at least one tagged complaint: {lead['restaurant_id'].nunique()}")
print(reach.to_string(index=False))
```

This generalizes to any N restaurants and any set of categories the LLM
labeling produces — it derives everything from `tax`/`long`, no hardcoded
category list or count.

The `reach` table's `n_restaurants` column becomes `stats.leadComplaint`-style
export additions to `src/data/project5.js` (exact export shape to be finalized
once the real table is in hand — likely
`export const complaintReach = [{category, nRestaurants, drag, nReviews}, ...]`
alongside the existing `complaints` export).

## Refresh workflow (runbook)

Documented so a future session doesn't reinvent this when the user says "data
updated, update the workflow":

1. Re-run `project5_analysis.ipynb` end-to-end, top to bottom, including the
   Task 5 cell above (it's a permanent cell in the notebook now, not a
   one-off).
2. The notebook's final cell already regenerates the `src/data/project5.js`
   export block (per the notebook's own generation cell) — confirm the
   regenerated file includes `stats`, `ratingHistogram`, `byCategory`,
   `ratingPairs`, `complaints`, `complaintReach` (new), and `districts`.
3. Do not hand-edit any number in `src/data/project5.js` — if a number looks
   wrong, fix the notebook cell that produces it and re-run, don't patch the
   generated file.
4. Grep `src/locales/en.json` and `src/locales/vi.json` for the `p5.` prefix
   and confirm no literal digit sequences were reintroduced in translated
   prose (a literal like "402" or "229" appearing in a `p5.*` string value is
   the smell — every number belongs in a `{{placeholder}}`, sourced from
   `project5.js`).
5. Run the existing `project5.test.js` cross-check tests (aggregate-vs-series
   consistency, per the "aa62a53 chore(p5): gitignore local snapshot copies"
   / "129ed51 feat(p5): published aggregates with cross-check tests" history)
   — add a test asserting `complaintReach` restaurant counts sum to
   `stats.reviewedRestaurants` minus restaurants with zero tagged complaints,
   if that invariant is knowable from the exported data.
6. Manually reload `/p5` in both `en` and `vi` locales and confirm every
   number on the page changed consistently with the new run (no stale
   literal left over from before the interpolation fix).

## Testing

- Existing `project5.test.js` aggregate cross-checks extended to cover the
  new `complaintReach` export (shape + invariants).
- i18n parity: any new `p5.*` key added in `en.json` gets its `vi.json`
  counterpart in the same commit (existing repo rule, CLAUDE.md).
- Manual visual check (per user's standing feedback on UX audits after
  visual changes): run `portfolio-ux-auditor` against the changed page in
  both themes and both locales after implementation.

## Out of scope

- Implementing any of this (spec/plan only, per task instructions).
- Changing sections 02, 03, 04's chart types, colors, or existing insight
  logic beyond the locale-interpolation fix.
- Re-deriving `drag`'s definition or methodology (unchanged: mean score
  without the complaint minus mean score with it, Foody 0–10 scale).
