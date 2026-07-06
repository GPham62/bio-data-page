import React from 'react'
import styles from './OverlapHeatmap.module.css'

const ORDER = ['DA', 'BA', 'DE', 'DS', 'SE']

// Cyan intensity scales with Jaccard similarity; diagonal is muted (self = 1).
function cellBg(a, b, j) {
  if (a === b) return 'rgba(99,110,123,0.15)'
  return `rgba(0,229,255,${0.06 + j * 0.55})`
}

export default function OverlapHeatmap({ matrix }) {
  const byKey = Object.fromEntries(matrix.map(c => [`${c.a}|${c.b}`, c.j]))
  return (
    <div className={styles.wrap}>
      <div className={styles.grid} style={{ gridTemplateColumns: `56px repeat(${ORDER.length}, 1fr)` }}>
        <div />
        {ORDER.map(c => <div key={c} className={styles.head}>{c}</div>)}
        {ORDER.map(a => (
          <React.Fragment key={a}>
            <div className={styles.head}>{a}</div>
            {ORDER.map(b => {
              const j = byKey[`${a}|${b}`]
              return (
                <div key={b} data-testid="cell" className={styles.cell}
                     style={{ background: cellBg(a, b, j) }}>
                  {j.toFixed(2)}
                </div>
              )
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}
