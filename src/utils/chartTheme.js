// Shared dark-theme constants for Recharts axes/grid. Recharts sets colors as
// SVG attributes (no CSS var support), so literal greys stay as fallbacks —
// but each tick also carries a CSS `style.fill` with the theme var, and CSS
// beats presentation attributes, so ticks follow the DARK/LIGHT toggle.
// (Grid lines get the same treatment via a .recharts-cartesian-grid rule in index.css.)
export const COLORS = { grid: '#1e2530', tickMuted: '#636e7b', tickStrong: '#cdd9e5' }

export const gridProps   = { strokeDasharray: '3 3', stroke: COLORS.grid }
// Recharts' default hover cursor is a bright #ccc block that washes out marks on
// the dark surface. Subtle neutral overlays instead, legible on dark and light.
export const barCursor  = { fill: 'rgba(125, 133, 144, 0.12)' }
export const lineCursor = { stroke: COLORS.tickMuted, strokeDasharray: '3 3' }

export const axisMuted   = { tick: { fill: COLORS.tickMuted, fontSize: '0.625rem', style: { fill: 'var(--muted)' } }, axisLine: false, tickLine: false }
export const axisStrong  = { tick: { fill: COLORS.tickStrong, fontSize: '0.625rem', style: { fill: 'var(--text)' } }, axisLine: false, tickLine: false }
export const axisStrong11 = { tick: { fill: COLORS.tickStrong, fontSize: '0.6875rem', style: { fill: 'var(--text)' } }, axisLine: false, tickLine: false }

// Role colors for TEXT/CSS contexts only — theme-aware vars that darken in
// light mode (see :root[data-theme="light"] in index.css). SVG chart marks
// keep the literal ROLE_COLORS from src/data/project1_roles.js.
// SE stays literal: #636e7b passes contrast on both surfaces.
export const ROLE_TEXT = {
  DA: 'var(--accent)',
  BA: 'var(--purple)',
  DE: 'var(--green)',
  DS: 'var(--accent2)',
  SE: '#636e7b',
}
