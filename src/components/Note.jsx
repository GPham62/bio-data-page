import React from 'react'
import styles from './Note.module.css'

// Small "ℹ + HTML paragraph" info callout. accent tints the icon + background.
export default function Note({ text, accent = 'var(--accent)' }) {
  return (
    <div className={styles.note} style={{ '--note-accent': accent }}>
      <span className={styles.icon}>ℹ</span>
      <p dangerouslySetInnerHTML={{ __html: text }} />
    </div>
  )
}
