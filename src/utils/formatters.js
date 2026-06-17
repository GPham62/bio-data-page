export const fmt    = (v) => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : v >= 1_000 ? `${(v / 1_000).toFixed(0)}k` : v
export const fmtUSD = (v) => `$${fmt(v)}`
export const pct    = (v) => `${(v * 100).toFixed(0)}%`
