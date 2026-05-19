import React from 'react'
import { useTranslation } from 'react-i18next'
import styles from './Header.module.css'

export default function Header({ setActive }) {
  const { t, i18n } = useTranslation()
  const isVI = i18n.language === 'vi'

  const toggleLang = () => {
    const next = isVI ? 'en' : 'vi'
    i18n.changeLanguage(next)
    localStorage.setItem('lang', next)
  }

  return (
    <header className={styles.header}>
      <button className={styles.brand} onClick={() => setActive('home')}>
        <span className={styles.brandNs}>pham.</span>
        <span className={styles.brandClass}>TuanAnh</span>
        <span className={styles.cursor} />
      </button>

      <div className={styles.right}>
        <button
          className={styles.langToggle}
          onClick={toggleLang}
          title={isVI ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
        >
          <span className={`${styles.langOpt} ${!isVI ? styles.langActive : ''}`}>EN</span>
          <span className={styles.langDiv}>/</span>
          <span className={`${styles.langOpt} ${isVI ? styles.langActive : ''}`}>VI</span>
        </button>
      </div>
    </header>
  )
}
