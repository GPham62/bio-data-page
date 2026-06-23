import React from 'react'
import Fx from './Fx.jsx'
import styles from './SectionTitle.module.css'

export default function SectionTitle({ index, title, sub, fxIndex = false, fxTitle = false }) {
  return (
    <div className={`${styles.wrap} fade-up`}>
      {fxIndex ? (
        <Fx effect="[fade f=0.5 min=0.2]" className={styles.index}>{index}</Fx>
      ) : (
        <span className={styles.index}>{index}</span>
      )}
      <div>
        <h2 className={styles.title}>
          {fxTitle ? <Fx effect="[wave]" hover>{title}</Fx> : title}
        </h2>
        {sub && <p className={styles.sub}>{sub}</p>}
      </div>
    </div>
  )
}
