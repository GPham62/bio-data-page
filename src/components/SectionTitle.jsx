import React, { useEffect, useRef } from 'react'
import styles from './SectionTitle.module.css'

export default function SectionTitle({ index, title, sub, fxIndex = false }) {
  const idxRef = useRef(null)
  useEffect(() => {
    if (!fxIndex) return
    const el = idxRef.current
    if (!el || !window.TextFX) return            // engine loads from index.html; absent in tests
    window.TextFX.mount(el)                       // reads data-textfx, rebuilds as per-char spans
    return () => window.TextFX.destroy(el)
  }, [fxIndex])

  return (
    <div className={`${styles.wrap} fade-up`}>
      <span
        ref={idxRef}
        className={fxIndex ? `${styles.index} textfx` : styles.index}
        data-textfx={fxIndex ? `[fade f=0.35 min=0.5]${index}[/]` : undefined}
      >
        {index}
      </span>
      <div>
        <h2 className={styles.title}>{title}</h2>
        {sub && <p className={styles.sub}>{sub}</p>}
      </div>
    </div>
  )
}
