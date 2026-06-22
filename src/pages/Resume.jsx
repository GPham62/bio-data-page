import React from 'react'
import { useTranslation } from 'react-i18next'
import styles from './Resume.module.css'

export default function Resume() {
  const { t } = useTranslation()

  return (
    <div className={styles.page}>
      <span className={styles.kicker}>{t('resume.kicker')}</span>
      <div className={styles.titleRow}>
        <h1 className={styles.title}>{t('resume.title')}</h1>
        <a href="/resume.html" target="_blank" rel="noopener noreferrer" className={styles.openLink}>
          {t('resume.open')} ↗
        </a>
      </div>
      <p className={styles.hint}>{t('resume.hint')}</p>
      <iframe
        src="/resume.html"
        className={styles.frame}
        title="CV – Phạm Tuấn Anh"
      />
    </div>
  )
}
