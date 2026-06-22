import React from 'react'
import { useTranslation } from 'react-i18next'
import SectionTitle from '../components/SectionTitle.jsx'
import styles from './Home.module.css'

const PROJECTS = ['p1', 'p2', 'p3']

function IconCollect() {
  return (
    <svg width="34" height="34" viewBox="0 0 64 64" fill="none">
      <rect x="14" y="10" width="30" height="40" rx="4" fill="rgba(89,136,255,0.15)" stroke="var(--accent-blue)" strokeWidth="2" />
      <line x1="21" y1="22" x2="37" y2="22" stroke="var(--accent-blue)" strokeWidth="2" strokeLinecap="round" />
      <line x1="21" y1="30" x2="37" y2="30" stroke="var(--accent-blue)" strokeWidth="2" strokeLinecap="round" />
      <line x1="21" y1="38" x2="31" y2="38" stroke="var(--accent-blue)" strokeWidth="2" strokeLinecap="round" />
      <circle cx="44" cy="44" r="11" fill="var(--bg2)" stroke="var(--accent-blue)" strokeWidth="2" />
      <path d="M39.5 44l3 3 6.5-6.5" stroke="var(--accent-blue)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconProcess() {
  return (
    <svg width="34" height="34" viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="14" r="8" fill="rgba(89,136,255,0.15)" stroke="var(--accent-blue)" strokeWidth="2" />
      <line x1="32" y1="22" x2="32" y2="32" stroke="var(--accent-blue)" strokeWidth="2" />
      <line x1="16" y1="40" x2="32" y2="32" stroke="var(--accent-blue)" strokeWidth="2" />
      <line x1="48" y1="40" x2="32" y2="32" stroke="var(--accent-blue)" strokeWidth="2" />
      <rect x="8" y="40" width="16" height="13" rx="2.5" fill="rgba(89,136,255,0.15)" stroke="var(--accent-blue)" strokeWidth="2" />
      <rect x="40" y="40" width="16" height="13" rx="2.5" fill="rgba(89,136,255,0.15)" stroke="var(--accent-blue)" strokeWidth="2" />
    </svg>
  )
}

function IconVisualize() {
  return (
    <svg width="34" height="34" viewBox="0 0 64 64" fill="none">
      <rect x="10" y="38" width="9" height="15" rx="1.5" fill="var(--accent-blue)" opacity="0.4" />
      <rect x="24" y="29" width="9" height="24" rx="1.5" fill="var(--accent-blue)" opacity="0.6" />
      <rect x="38" y="18" width="9" height="35" rx="1.5" fill="var(--accent-blue)" opacity="0.8" />
      <rect x="52" y="9" width="9" height="44" rx="1.5" fill="var(--accent-blue)" />
    </svg>
  )
}

const WHATIDO_ICONS = [IconCollect, IconProcess, IconVisualize]

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

  const whatIDoItems = t('home.whatIDo.items', { returnObjects: true })

  return (
    <div className={styles.page}>

      {/* ── Friendly greeting hero ── */}
      <section className={`${styles.greetSection} fade-up`}>
        <span className={styles.greetKicker}>{t('home.greeting.kicker')}</span>
        <h1 className={styles.greetTitle}>{t('home.greeting.title')}</h1>
        <p className={styles.greetText}>{t('home.greeting.p1')}</p>
        <p className={styles.greetText}>{t('home.greeting.p2')}</p>
      </section>

      {/* ── What I Can Do — 3 column ── */}
      <section className={styles.section}>
        <SectionTitle index="01" title={t('home.whatIDo.title')} sub={t('home.whatIDo.sub')} />
        <div className={styles.whatIDoGrid}>
          {whatIDoItems.map((item, i) => {
            const Icon = WHATIDO_ICONS[i]
            return (
              <div key={item.title} className={styles.whatIDoCard}>
                <div className={styles.whatIDoIconWrap}><Icon /></div>
                <h3 className={styles.whatIDoTitle}>{item.title}</h3>
                <p className={styles.whatIDoDesc}>{item.desc}</p>
                <div className={styles.skillRow}>
                  {item.skills.map(skill => (
                    <span key={skill} className={styles.skillTag}>{skill}</span>
                  ))}
                </div>
              </div>
            )
          })}
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
