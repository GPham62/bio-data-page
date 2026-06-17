import React from 'react'
import styles from './RecommendationsList.module.css'

export default function RecommendationsList({ title, items, accent = 'var(--accent)' }) {
  return (
    <div className={styles.recsBox} style={{ '--recs-accent': accent }}>
      <h3 className={styles.recsTitle}>{title}</h3>
      <ul className={styles.recsList}>
        {items.map((item, i) => (
          <li key={i} className={styles.recsItem}>
            <span className={styles.recsNum}>0{i + 1}</span>
            <span dangerouslySetInnerHTML={{ __html: item }} />
          </li>
        ))}
      </ul>
    </div>
  )
}
