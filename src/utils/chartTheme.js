// Shared dark-theme constants for Recharts axes/grid. Recharts needs literal JS
// values (not CSS vars), so these three greys live here as the single source of truth.
// Spread them onto axes/grid: <XAxis {...axisMuted} tickFormatter={fmt} />
export const COLORS = { grid: '#1e2530', tickMuted: '#636e7b', tickStrong: '#cdd9e5' }

export const gridProps   = { strokeDasharray: '3 3', stroke: COLORS.grid }
export const axisMuted   = { tick: { fill: COLORS.tickMuted, fontSize: '0.625rem' }, axisLine: false, tickLine: false }
export const axisStrong  = { tick: { fill: COLORS.tickStrong, fontSize: '0.625rem' }, axisLine: false, tickLine: false }
export const axisStrong11 = { tick: { fill: COLORS.tickStrong, fontSize: '0.6875rem' }, axisLine: false, tickLine: false }
