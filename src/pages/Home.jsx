import React from 'react'
import { useTranslation } from 'react-i18next'
import SectionTitle from '../components/SectionTitle.jsx'
import styles from './Home.module.css'

const PROJECTS = ['p1', 'p2', 'p3']


const GAMES = [
  {
    name: 'Relic Bag: Shadow Hunter',
    genre: 'Puzzle · Action',
    url: 'https://play.google.com/store/apps/details?id=com.TSH014.bag.fight.stickman.shadow.hero.puzzle&hl=en',
  },
  {
    name: 'Shadow War: Idle RPG Survival',
    genre: 'Idle · RPG',
    url: 'https://play.google.com/store/apps/details?id=com.shadow.war.legend.slime.idle.rpg.survival.game&hl=en',
  },
  {
    name: 'Stickman vs Monster: Idle RPG',
    genre: 'Idle · Action',
    url: 'https://play.google.com/store/apps/details?id=com.stickman.monster.epic.stickman.war.shadow.idle.game&hl=en',
  },
  {
    name: 'Epic Shadow Idle RPG',
    genre: 'Idle · RPG',
    url: 'https://play.google.com/store/apps/details?id=com.tsh012.cyber.war.idle.rpg.games&hl=en',
  },
  {
    name: 'Space War Idle RPG',
    genre: 'Idle · Strategy',
    url: 'https://play.google.com/store/apps/details?id=com.zitga.multiverse.war.idle.star.trek.game&hl=en',
  },
]

export default function Home({ setActive }) {
  const { t } = useTranslation()

  return (
    <div className={styles.page}>

      {/* ── Hero ── */}
      <section className={`${styles.heroRow} fade-up`}>
        <div className={styles.heroPic}>[ photo ]</div>
        <div>
          <span className={styles.greetKicker}>{t('home.greeting.kicker')}</span>
          <h1 className={styles.greetTitle}>{t('home.greeting.title')}</h1>
          <p className={styles.tagline}>{t('home.greeting.tagline')}</p>
          <div className={styles.currentlyBlock}>
            <div className={styles.currentlyRow}>
              <span className={styles.currentlyIcon}>🎮</span>
              <span className={styles.currentlyLabel}>{t('home.greeting.currently.label_playing')}</span>
              <span className={styles.currentlyVal}>{t('home.greeting.currently.playing')}</span>
            </div>
            <div className={styles.currentlyRow}>
              <span className={styles.currentlyIcon}>📚</span>
              <span className={styles.currentlyLabel}>{t('home.greeting.currently.label_reading')}</span>
              <span className={styles.currentlyVal}>{t('home.greeting.currently.reading')}</span>
            </div>
            <div className={styles.currentlyRow}>
              <span className={styles.currentlyIcon}>🛠️</span>
              <span className={styles.currentlyLabel}>{t('home.greeting.currently.label_building')}</span>
              <span className={styles.currentlyVal}>{t('home.greeting.currently.building')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Character Sheet ── */}
      <section className={styles.section}>
        <SectionTitle index="02" title={t('home.charSheet.title')} sub={t('home.charSheet.sub')} />
        <div className={styles.charSheet}>
          <div className={styles.charSheetHeader}>
            <div className={styles.charRow}>
              <span className={styles.charLabel}>{t('home.charSheet.labels.class')}</span>
              <span className={styles.charVal}>{t('home.charSheet.class')}</span>
            </div>
            <div className={styles.charRow}>
              <span className={styles.charLabel}>{t('home.charSheet.labels.former')}</span>
              <span className={styles.charVal}>{t('home.charSheet.former')}</span>
            </div>
            <div className={styles.charRow}>
              <span className={styles.charLabel}>{t('home.charSheet.labels.level')}</span>
              <span className={styles.charVal}>{t('home.charSheet.level')}</span>
            </div>
            <div className={styles.charRow}>
              <span className={styles.charLabel}>{t('home.charSheet.labels.exp')}</span>
              <span className={styles.charVal}>{t('home.charSheet.exp')}</span>
            </div>
          </div>
          <div className={styles.charDivider} />
          <div className={styles.charSkills}>
            {t('home.charSheet.skills', { returnObjects: true }).map(skill => (
              <div key={skill.name} className={styles.statRow}>
                <span className={skill.former ? styles.statNameFormer : styles.statName}>
                  {skill.name}
                </span>
                <div className={styles.statBar}>
                  <div
                    className={skill.former ? styles.statBarFillFormer : styles.statBarFill}
                    style={{ width: `${skill.pct}%` }}
                  />
                </div>
                <span className={skill.former ? styles.statLevelFormer : styles.statLevel}>
                  {skill.level}{skill.former ? ' ↩' : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About me (condensed) ── */}
      <section className={styles.section}>
        <SectionTitle index="02" title={t('home.about.title')} sub={t('home.about.sub')} />

        <div className={styles.pivotBox}>
          <span className={styles.pivotArrow}>&#8599;</span>
          <div>
            <span className={styles.pivotLabel}>{t('home.about.pivot_label')}</span>
            <p className={styles.pivotText}>{t('home.about.pivot_text')}</p>
          </div>
        </div>

        <div className={styles.gamesLabel}>{t('home.about.games_label')}</div>
        <div className={styles.gameGrid}>
          {GAMES.map(g => (
            <a key={g.name} href={g.url} target="_blank" rel="noopener noreferrer" className={styles.gameCard}>
              <span className={styles.gameIcon}>▶</span>
              <div>
                <span className={styles.gameName}>{g.name}</span>
                <span className={styles.gameGenre}>{g.genre}</span>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ── Selected projects — naledi-style hover grid (folds in the old carousel's GIF + motion) ── */}
      <section className={styles.section}>
        <SectionTitle index="03" title={t('home.portfolio.title')} sub={t('home.portfolio.sub')} />

        <div className={styles.projectGrid}>
          {PROJECTS.map((id, i) => (
            <div key={id} className={styles.projectCard} onClick={() => setActive(id)}>
              <div className={styles.projectThumbWrap}>
                <img src={`/gif_import/${id}.gif`} className={styles.projectThumb} alt="" />
                <div className={styles.projectTopRow}>
                  <span className={styles.projectNum}>0{i + 1}</span>
                  <span className={styles.badgeLive}>{t('home.badge_live')}</span>
                </div>
                <span className={styles.projectKicker}>{t('home.portfolio.label')}</span>
              </div>
              <div className={styles.projectInfo}>
                <h3 className={styles.projectCardTitle}>{t(`home.projects.${id}.title`)}</h3>
                <div className={styles.projectDetails}>
                  <p className={styles.projectCardDesc}>{t(`home.projects.${id}.desc`)}</p>
                  <div className={styles.projectTags}>
                    {t(`home.projects.${id}.tags`, { returnObjects: true }).map(tag => (
                      <span key={tag} className={styles.projectTag}>{tag}</span>
                    ))}
                  </div>
                  <div className={styles.hint}>{t('home.open_hint')}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.comingSoonBanner}>
          <span className={styles.badgeWip}>{t('home.badge_wip')}</span>
          <div>
            <span className={styles.comingSoonTitle}>{t('home.projects.coming.title')}</span>
            <span className={styles.comingSoonDesc}>{t('home.projects.coming.desc')}</span>
          </div>
        </div>
      </section>

      {/* ── Get in touch ── */}
      <section className={`${styles.contactSection} fade-up`}>
        <div className={styles.contactCard}>
          <span className={styles.greetKicker}>{t('home.contact.kicker')}</span>
          <h2 className={styles.contactTitle}>{t('home.contact.title')}</h2>
          <p className={styles.contactText}>{t('home.contact.text')}</p>
          <div className={styles.contactActions}>
            <a href="mailto:ptuananh196@gmail.com" className={styles.contactBtn}>
              {t('home.contact.cta')}
            </a>
            <a href="https://www.linkedin.com/in/tuananhpham6296/" target="_blank" rel="noopener noreferrer" className={styles.contactLink}>
              {t('sidebar.social.linkedin')}
            </a>
            <a href="https://github.com/GPham62" target="_blank" rel="noopener noreferrer" className={styles.contactLink}>
              {t('sidebar.social.github')}
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
