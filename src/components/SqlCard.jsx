import React, { useState } from 'react'
import styles from './SqlCard.module.css'

export default function SqlCard({ title, code, href, linkLabel, accent = 'var(--accent)', tabs }) {
  const [active, setActive] = useState(0)
  const cur = tabs ? tabs[active] : { title, code, href, linkLabel }
  return (
    <div className={styles.card} style={{ '--sql-accent': accent }}>
      <div className={styles.header}>
        {tabs && (
          <div className={styles.tabs}>
            {tabs.map((tab, i) => (
              <button key={tab.label} type="button"
                      className={i === active ? `${styles.tab} ${styles.tabActive}` : styles.tab}
                      onClick={() => setActive(i)}>
                {tab.label}
              </button>
            ))}
          </div>
        )}
        <span className={styles.title}>{cur.title ?? title}</span>
        <a className={styles.link} href={cur.href} target="_blank" rel="noopener noreferrer">
          {cur.linkLabel} ↗
        </a>
      </div>
      <pre className={styles.code}>{cur.code}</pre>
    </div>
  )
}
