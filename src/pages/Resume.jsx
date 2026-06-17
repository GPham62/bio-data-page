import React from 'react'
import { useTranslation } from 'react-i18next'
import styles from './Resume.module.css'

export default function Resume({ setActive }) {
  const { t } = useTranslation()

  return (
    <div className={styles.page}>
      <span className={styles.kicker}>{t('resume.kicker')}</span>
      <div className={styles.titleRow}>
        <h1 className={styles.title}>{t('resume.title')}</h1>
        <span className={styles.badgeWip}>{t('home.badge_wip')}</span>
      </div>
      <p className={styles.text}>{t('resume.text')}</p>
      <div className={styles.actions}>
        <button className={styles.btnPrimary} onClick={() => setActive('home')}>
          {t('resume.cta_projects')}
        </button>
        <a href="mailto:ptuananh196@gmail.com" className={styles.btnSecondary}>
          {t('resume.cta_email')}
        </a>
      </div>
    </div>
  )
}
