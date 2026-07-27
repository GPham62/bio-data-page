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

export function pickTopByShare(complaints) {
  if (complaints.length === 0) return null
  const top = complaints.reduce((best, row) => (row.share > best.share ? row : best))
  return { category: top.category, n: top.n, share: top.share }
}

export function pickTopByDrag(complaints) {
  const scored = complaints.filter(row => row.drag != null)
  if (scored.length === 0) return null
  const top = scored.reduce((best, row) => (row.drag > best.drag ? row : best))
  return { category: top.category, drag: top.drag }
}

export function pickTopByReach(complaintReach) {
  if (!complaintReach || complaintReach.length === 0) return null
  const top = complaintReach.reduce((best, row) =>
    row.nRestaurants > best.nRestaurants ? row : best
  )
  return { category: top.category, nRestaurants: top.nRestaurants }
}
