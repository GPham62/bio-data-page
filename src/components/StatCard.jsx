import React from 'react'
import styles from './StatCard.module.css'

export default function StatCard({ label, value, sub, accent, delay = 0 }) {
  return (
    <div
      className={`${styles.card} fade-up`}
      style={{ animationDelay: `${delay}s`, '--card-accent': accent || 'var(--accent)' }}
    >
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{value}</span>
      {sub && <span className={styles.sub}>{sub}</span>}
    </div>
  )
}
