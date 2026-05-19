import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Header    from './components/Header.jsx'
import Home      from './pages/Home.jsx'
import Biography from './pages/Biography.jsx'
import Project1  from './pages/Project1.jsx'
import Project2  from './pages/Project2.jsx'
import styles    from './App.module.css'

export default function App() {
  const [active, setActive] = useState('home')
  const { t } = useTranslation()

  useEffect(() => { window.scrollTo(0, 0) }, [active])

  return (
    <div className={styles.app}>
      <Header setActive={setActive} />
      <main className={styles.main} key={active}>
        {active === 'home' && <Home      setActive={setActive} />}
        {active === 'bio'  && <Biography setActive={setActive} />}
        {active === 'p1'   && <Project1  setActive={setActive} />}
        {active === 'p2'   && <Project2  setActive={setActive} />}
      </main>
      {active !== 'home' && (
        <footer className={styles.footer}>
          <span>{t('footer.built')}</span>
          <span>{t('footer.data')}</span>
        </footer>
      )}
    </div>
  )
}
