import React from 'react'
import { useTranslation } from 'react-i18next'
import { fmtUSD } from '../utils/formatters.js'
import { ROLE_TEXT } from '../utils/chartTheme.js'
import styles from './RoleSelectStrip.module.css'

// Fighting-game character select: 5 contender cards under the hero.
export default function RoleSelectStrip({ cards }) {
  const { t } = useTranslation()
  return (
    <div className={styles.strip}>
      {cards.map((c, i) => (
        <div key={c.short} className={styles.card}
             style={{ '--card-accent': ROLE_TEXT[c.short] || c.color, animationDelay: `${0.08 * i}s` }}>
          <span className={styles.short}>{c.short}</span>
          <span className={styles.role}>{c.role}</span>
          <span className={styles.salary}>{fmtUSD(c.salary)}<em>{t('p1.strip_median')}</em></span>
          <span className={styles.badge}>{t(`p1.${c.badgeKey}`)}</span>
        </div>
      ))}
    </div>
  )
}
