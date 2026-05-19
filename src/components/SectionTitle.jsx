import React from 'react'
import styles from './SectionTitle.module.css'

export default function SectionTitle({ index, title, sub }) {
  return (
    <div className={`${styles.wrap} fade-up`}>
      <span className={styles.index}>{index}</span>
      <div>
        <h2 className={styles.title}>{title}</h2>
        {sub && <p className={styles.sub}>{sub}</p>}
      </div>
    </div>
  )
}
