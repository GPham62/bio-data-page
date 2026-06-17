import React from 'react'
import styles from './InsightBlock.module.css'

export default function InsightBlock({ label, text, accent = 'var(--accent)' }) {
  return (
    <div className={styles.insight} style={{ '--insight-accent': accent }}>
      <span className={styles.insightLabel}>{label}</span>
      <p className={styles.insightText} dangerouslySetInnerHTML={{ __html: text }} />
    </div>
  )
}
