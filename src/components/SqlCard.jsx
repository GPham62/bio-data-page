import React from 'react'
import styles from './SqlCard.module.css'

export default function SqlCard({ title, code, href, linkLabel, accent = 'var(--accent)' }) {
  return (
    <div className={styles.card} style={{ '--sql-accent': accent }}>
      <div className={styles.header}>
        <span className={styles.title}>{title}</span>
        <a className={styles.link} href={href} target="_blank" rel="noopener noreferrer">
          {linkLabel} ↗
        </a>
      </div>
      <pre className={styles.code}>{code}</pre>
    </div>
  )
}
