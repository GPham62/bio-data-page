import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Sidebar   from './components/Sidebar.jsx'
import Home      from './pages/Home.jsx'
import Resume    from './pages/Resume.jsx'
import Project1  from './pages/Project1.jsx'
import Project2  from './pages/Project2.jsx'
import Project3  from './pages/Project3.jsx'
import Project4  from './pages/Project4.jsx'
import Project5  from './pages/Project5.jsx'
import Reading   from './pages/Reading.jsx'
import styles    from './App.module.css'

export default function App() {
  const [active, setActive] = useState('home')
  const { t } = useTranslation()

  useEffect(() => { window.scrollTo(0, 0) }, [active])

  return (
    <div className={styles.app}>
      <div className={styles.body}>
        <Sidebar active={active} setActive={setActive} />
        <div className={styles.contentCol}>
          <main className={styles.main} key={active}>
            {active === 'home'   && <Home    setActive={setActive} />}
            {active === 'resume' && <Resume  setActive={setActive} />}
            {active === 'p1'   && <Project1  setActive={setActive} />}
            {active === 'p2'   && <Project2  setActive={setActive} />}
            {active === 'p3'   && <Project3  setActive={setActive} />}
            {active === 'p4'   && <Project4  setActive={setActive} />}
            {active === 'p5'   && <Project5  setActive={setActive} />}
            {active === 'reading' && <Reading />}
          </main>
          {active !== 'home' && (
            <footer className={styles.footer}>
              <span>{t('footer.built')}</span>
              <span>{t('footer.data')}</span>
            </footer>
          )}
        </div>
      </div>
    </div>
  )
}
