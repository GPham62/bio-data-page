import React from 'react'
import { useTranslation } from 'react-i18next'
import styles from './Project2.module.css'

const ICONS = ['🗄️', '🔧', '📊', '🤖', '🌐']

export default function Project2({ setActive }) {
  const { t } = useTranslation()
  const items = t('p2.items', { returnObjects: true })

  return (
    <div className={styles.page} style={{ position: 'relative' }}>
      <button className="next-btn" onClick={() => setActive('home')}>
        ← Back to Home
      </button>
      <div className={`${styles.hero} fade-up`}>
        <div className={styles.badge}>
          <span className={styles.dot} />
          {t('p2.badge')}
        </div>

        <h1 className={styles.title}>
          {t('p2.title1')}<br />
          <span className={styles.accent}>{t('p2.title2')}</span>
        </h1>

        <p className={styles.sub}>{t('p2.sub')}</p>

        <div className={styles.checklist}>
          {items.map((label, i) => (
            <div
              key={i}
              className={`${styles.item} fade-up`}
              style={{ animationDelay: `${0.1 + i * 0.07}s` }}
            >
              <span className={styles.itemIcon}>{ICONS[i]}</span>
              <span className={styles.itemLabel}>{label}</span>
              <span className={styles.itemStatus}>{t('p2.pending')}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.deco} aria-hidden>
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className={styles.decoCell} style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
  )
}
