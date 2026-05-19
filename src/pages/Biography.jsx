import React from 'react'
import { useTranslation } from 'react-i18next'
import styles from './Biography.module.css'

export default function Biography({ setActive }) {
  const { t } = useTranslation()
  const gameSkills = t('bio.game_skills', { returnObjects: true })

  return (
    <div className={styles.page} style={{ position: 'relative' }}>
      <button className="next-btn" onClick={() => setActive('p1')}>
        01 / Recruit Analysis →
      </button>

      {/* ── Hero ── */}
      <section className={`${styles.hero} fade-up`}>
        <div className={styles.heroInner}>
          <div className={styles.heroText}>
            <div className={styles.heroTag}>{t('bio.tag')}</div>
            <h1 className={styles.title}>
              {t('bio.title1')}<br />
              <span className={styles.accent}>{t('bio.title2')}</span>
            </h1>
            <p className={styles.intro}>{t('bio.intro')}</p>
          </div>
          <div className={styles.avatarWrap}>
            <img src="/bio/profile.png" alt="Pham Tuan Anh" className={styles.avatar} />
          </div>
        </div>
      </section>

      {/* ── Section 01 · Career Journey ── */}
      <section className={`${styles.section} fade-up`} style={{ animationDelay: '0.1s' }}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionNum}>01</span>
          <div>
            <div className={styles.sectionTitle}>{t('bio.s1_title')}</div>
            <div className={styles.sectionSub}>{t('bio.s1_sub')}</div>
          </div>
        </div>

        <div className={styles.journeyGrid}>
          <div className={styles.statBox}>
            <span className={styles.statValue}>{t('bio.years_value')}</span>
            <span className={styles.statLabel}>{t('bio.years_label')}</span>
            <span className={styles.statPeriod}>{t('bio.years_period')}</span>
          </div>

          <div className={styles.skillsBox}>
            <span className={styles.skillsLabel}>{t('bio.game_skills_label')}</span>
            <div className={styles.pills}>
              {Array.isArray(gameSkills) && gameSkills.map((s) => (
                <span key={s} className={styles.pill}>{s}</span>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.pivotBox}>
          <span className={styles.pivotArrow}>↗</span>
          <div>
            <span className={styles.pivotLabel}>{t('bio.pivot_label')}</span>
            <p className={styles.pivotText}>{t('bio.pivot_text')}</p>
          </div>
        </div>
      </section>

      {/* ── Section 02 · Game Showcase ── */}
      <section className={`${styles.section} fade-up`} style={{ animationDelay: '0.2s' }}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionNum}>02</span>
          <div>
            <div className={styles.sectionTitle}>{t('bio.s2_title')}</div>
            <div className={styles.sectionSub}>{t('bio.s2_sub')}</div>
          </div>
        </div>

        <div className={styles.gameList}>
          <a
            href="https://play.google.com/store/apps/details?id=com.tsh012.cyber.war.idle.rpg.games&hl=en"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.gameCard}
          >
            <div className={styles.gameIconWrap}>
              <img src="/bio/epic-shadow.png" alt="Epic Shadow" className={styles.gameIconImg} />
            </div>
            <div className={styles.gameInfo}>
              <div className={styles.gameTop}>
                <span className={styles.gameNum}>01</span>
                <span className={styles.gamePlatform}>Google Play</span>
              </div>
              <h3 className={styles.gameTitle}>Epic Shadow: Idle RPG War</h3>
              <p className={styles.gameDesc}>
                Cyber-themed idle RPG — build your squad, manage resources, and battle through increasingly difficult waves. Published on Google Play.
              </p>
              <div className={styles.gameFooter}>
                <div className={styles.gameTags}>
                  <span className={styles.gameTag}>Idle RPG</span>
                  <span className={styles.gameTag}>C#</span>
                  <span className={styles.gameTag}>Unity</span>
                </div>
                <span className={styles.gameLink}>Play Store →</span>
              </div>
            </div>
          </a>

          <a
            href="https://play.google.com/store/apps/details?id=com.zitga.multiverse.war.idle.star.trek.game&hl=en"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.gameCard}
          >
            <div className={styles.gameIconWrap}>
              <img src="/bio/space-war.png" alt="Space War" className={styles.gameIconImg} />
            </div>
            <div className={styles.gameInfo}>
              <div className={styles.gameTop}>
                <span className={styles.gameNum}>02</span>
                <span className={styles.gamePlatform}>Google Play</span>
              </div>
              <h3 className={styles.gameTitle}>Space War: Idle Tower Defense</h3>
              <p className={styles.gameDesc}>
                Sci-fi idle tower defense — deploy units across the galaxy, defend against waves of enemies, and progress through a multiverse campaign.
              </p>
              <div className={styles.gameFooter}>
                <div className={styles.gameTags}>
                  <span className={styles.gameTag}>Tower Defense</span>
                  <span className={styles.gameTag}>C#</span>
                  <span className={styles.gameTag}>Unity</span>
                </div>
                <span className={styles.gameLink}>Play Store →</span>
              </div>
            </div>
          </a>
        </div>
      </section>

    </div>
  )
}
