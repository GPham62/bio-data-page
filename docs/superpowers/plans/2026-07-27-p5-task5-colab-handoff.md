# P5 Task 5 — Colab handoff (paste this to the Colab agent)

## Your one job

Run one new cell in `project5_analysis.ipynb` and report back its exact
printed output. Do not modify, save, or commit anything else. Do not touch
any other cell's code or output.

## Steps

1. Open `project5_analysis.ipynb` in this Colab session (the snapshot file
   it loads, `snapshot_20260725T061403.json`, and `review_labels.json`
   should already be in this session's files — if either is missing, stop
   and say so instead of guessing a path).
2. Run every cell top to bottom, in order, up through the cell titled
   "Task 4: sizing the taxonomy" (its output starts with
   `overall mean score 7.01`). Confirm that cell ran without error before
   continuing.
3. Insert a new cell immediately after it and paste in exactly this code
   (no edits):

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

4. Run that cell.
5. Copy the three printed outputs **verbatim** — the two count lines and the
   full `reach` table — and paste them back into this conversation exactly
   as printed. Nothing else needs summarizing or reformatting.

## Guardrails

- Don't run any cell after this one (there may be a `project5.js`-generation
  cell later in the notebook — leave it alone; a separate step handles
  regenerating that file once this output is in hand).
- Don't save the notebook back to Drive/GitHub, don't download it, don't
  change the runtime.
- If any cell above Task 4 errors out, stop and report the exact error
  instead of trying to fix it — the notebook's earlier cells are out of
  scope for this handoff.
