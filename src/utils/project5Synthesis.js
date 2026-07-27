// Pure, data-shape-generic derivation helpers for Project 5's synthesis
// copy. None of these hardcode a category name, a count, or a dataset size —
// every one re-derives its answer from whatever series is passed in, so the
// page's conclusion stays correct after the underlying dataset is re-run at
// a different size. See docs/superpowers/plans/2026-07-27-p5-bluf-synthesis.md.

export function pickMaxGapPair(ratingPairs) {
  if (!ratingPairs || ratingPairs.length === 0) return null
  let best = ratingPairs[0]
  let bestGap = Math.abs(best.sf * 2 - best.foody)
  for (const pair of ratingPairs.slice(1)) {
    const gap = Math.abs(pair.sf * 2 - pair.foody)
    if (gap > bestGap) {
      best = pair
      bestGap = gap
    }
  }
  return { sf: best.sf, foody: best.foody }
}
