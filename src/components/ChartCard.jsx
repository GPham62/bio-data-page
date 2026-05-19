import React from 'react'
import styles from './ChartCard.module.css'

export default function ChartCard({ title, sub, children, delay = 0, span = 1 }) {
  return (
    <div
      className={`${styles.card} fade-up`}
      style={{ animationDelay: `${delay}s`, gridColumn: span === 2 ? 'span 2' : undefined }}
    >
      <div className={styles.header}>
        <span className={styles.title}>{title}</span>
        {sub && <span className={styles.sub}>{sub}</span>}
      </div>
      <div className={styles.body}>{children}</div>
    </div>
  )
}
