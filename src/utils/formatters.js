export const fmt    = (v) => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : v >= 1_000 ? `${(v / 1_000).toFixed(0)}k` : v
export const fmtUSD = (v) => `$${fmt(v)}`
// Project 3's Online Retail dataset is a UK retailer billing in sterling, so its
// figures are GBP — not USD like Project 1's salary data. Keep the two separate;
// re-badging pounds as dollars overstates the revenue by roughly a third.
export const fmtGBP = (v) => `£${fmt(v)}`
export const pct    = (v) => `${(v * 100).toFixed(0)}%`
