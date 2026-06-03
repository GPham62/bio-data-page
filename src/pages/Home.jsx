import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import styles from './Home.module.css'

const CARDS = [
  { id: 'bio', num: '00', status: null },
  { id: 'p1',  num: '01', status: 'live' },
  { id: 'p2',  num: '02', status: 'live' },
  { id: 'p3',  num: '03', status: 'live' },
]

const GIF_SRCS = CARDS.map(c => `/gif_import/${c.id}.gif`)

export default function Home({ setActive }) {
  const { t } = useTranslation()
  const [current, setCurrent] = useState(0)
  const locked = useRef(false)

  useEffect(() => {
    GIF_SRCS.forEach(src => { new Image().src = src })
  }, [])

  const go = useCallback((dir) => {
    if (locked.current) return
    setCurrent(prev => {
      const next = prev + dir
      if (next < 0 || next >= CARDS.length) return prev
      return next
    })
    locked.current = true
    setTimeout(() => { locked.current = false }, 550)
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft')  go(-1)
      if (e.key === 'ArrowRight') go(1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go])

  useEffect(() => {
    let last = 0
    const onWheel = (e) => {
      const now = Date.now()
      if (now - last < 700) return
      last = now
      if (e.deltaY > 20 || e.deltaX > 20) go(1)
      else if (e.deltaY < -20 || e.deltaX < -20) go(-1)
    }
    window.addEventListener('wheel', onWheel, { passive: true })
    return () => window.removeEventListener('wheel', onWheel)
  }, [go])

  return (
    <div className={styles.page}>

      {/* blurred GIF background — one per card, cross-fades on swipe */}
      <div className={styles.gifBg} aria-hidden>
        {CARDS.map((card, i) => (
          <img
            key={card.id}
            src={`/gif_import/${card.id}.gif`}
            className={`${styles.gif} ${i === current ? styles.gifVisible : ''}`}
            alt=""
          />
        ))}
      </div>

      <div className={styles.stage}>
        {CARDS.map((card, i) => {
          const offset = i - current
          if (Math.abs(offset) > 1) return null
          const isCenter = offset === 0
          return (
            <div
              key={card.id}
              className={`${styles.card} ${isCenter ? styles.cardCenter : styles.cardSide}`}
              style={{ '--offset': offset }}
              onClick={() => isCenter ? setActive(card.id) : go(offset)}
            >
              <div className={`${styles.floatWrap} ${isCenter ? styles.floating : ''}`}>
              <div className={styles.cardInner}>
                <div className={styles.cardTop}>
                  <span className={styles.cardNum}>{card.num}</span>
                  {card.status === 'live' && <span className={styles.badgeLive}>{t('home.badge_live')}</span>}
                  {card.status === 'wip'  && <span className={styles.badgeWip}>{t('home.badge_wip')}</span>}
                </div>

                <h2 className={styles.cardTitle}>{t(`home.cards.${card.id}.title`)}</h2>
                <p className={styles.cardRole}>{t(`home.cards.${card.id}.role`)}</p>
                <p className={styles.cardDesc}>{t(`home.cards.${card.id}.desc`)}</p>

                <div className={styles.cardTags}>
                  {t(`home.cards.${card.id}.tags`, { returnObjects: true }).map(tag => (
                    <span key={tag} className={styles.tag}>{tag}</span>
                  ))}
                </div>

                {isCenter && (
                  <div className={styles.enterHint}>{t('home.open_hint')}</div>
                )}
              </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className={styles.controls}>
        <button
          className={styles.arrow}
          onClick={() => go(-1)}
          disabled={current === 0}
        >←</button>

        <span className={styles.counter}>{current + 1} / {CARDS.length}</span>

        <button
          className={styles.arrow}
          onClick={() => go(1)}
          disabled={current === CARDS.length - 1}
        >→</button>
      </div>

      <div className={styles.dots}>
        {CARDS.map((_, i) => (
          <button
            key={i}
            className={`${styles.dot} ${i === current ? styles.dotActive : ''}`}
            onClick={() => setCurrent(i)}
          />
        ))}
      </div>
    </div>
  )
}
