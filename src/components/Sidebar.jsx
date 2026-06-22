import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import styles from './Sidebar.module.css'

const NAV = [
  { id: 'home',   key: 'home' },
  { id: 'resume', key: 'resume' },
]

export default function Sidebar({ active, setActive }) {
  const { t, i18n } = useTranslation()
  const [avatarBroken, setAvatarBroken] = useState(false)
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark')
  const isVI = i18n.language === 'vi'
  const isLight = theme === 'light'

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleLocale = () => {
    const next = isVI ? 'en' : 'vi'
    i18n.changeLanguage(next)
    localStorage.setItem('locale', next)
  }

  const toggleTheme = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'))

  return (
    <aside className={styles.sidebar}>
      <button className={styles.profile} onClick={() => setActive('home')}>
        {avatarBroken ? (
          <div className={styles.avatarFallback}>TA</div>
        ) : (
          <div className={styles.avatarWrap}>
            <img
              src="/bio/profile.png"
              alt="Pham Tuan Anh"
              className={styles.avatar}
              onError={() => setAvatarBroken(true)}
            />
          </div>
        )}
        <div className={styles.profileName}>Pham Tuan Anh</div>
        <div className={styles.profileRole}>{t('sidebar.role')}</div>
      </button>

      <nav className={styles.nav}>
        {NAV.map(item => (
          <button
            key={item.id}
            className={`${styles.navItem} ${active === item.id ? styles.navActive : ''}`}
            onClick={() => setActive(item.id)}
          >
            <span className={styles.navDot} />
            {t(`sidebar.nav.${item.key}`)}
          </button>
        ))}
      </nav>

      <div className={styles.social}>
        <a href="https://github.com/GPham62" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
          {t('sidebar.social.github')}
        </a>
        <a href="https://www.linkedin.com/in/tuananhpham6296/" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
          {t('sidebar.social.linkedin')}
        </a>
        <a href="mailto:ptuananh196@gmail.com" className={styles.socialLink}>
          {t('sidebar.social.email')}
        </a>

        <div className={styles.toggleGroup}>
          <button
            className={styles.pillToggle}
            onClick={toggleTheme}
            title={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            <span className={`${styles.pillOpt} ${!isLight ? styles.pillActive : ''}`}>DARK</span>
            <span className={styles.pillDiv}>/</span>
            <span className={`${styles.pillOpt} ${isLight ? styles.pillActive : ''}`}>LIGHT</span>
          </button>

          <button
            className={styles.pillToggle}
            onClick={toggleLocale}
            title={isVI ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
          >
            <span className={`${styles.pillOpt} ${!isVI ? styles.pillActive : ''}`}>EN</span>
            <span className={styles.pillDiv}>/</span>
            <span className={`${styles.pillOpt} ${isVI ? styles.pillActive : ''}`}>VI</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
