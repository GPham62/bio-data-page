import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import SectionTitle from '../components/SectionTitle.jsx'
import styles from './Home.module.css'

const PROJECTS = ['p1', 'p2', 'p3']

const SHOWCASE_GAMES = [
  {
    name: 'Relic Bag: Shadow Hunter',
    genre: 'Puzzle · Action',
    url: 'https://play.google.com/store/apps/details?id=com.TSH014.bag.fight.stickman.shadow.hero.puzzle&hl=en',
    icon: '/game-icons/relic-bag.png',
  },
  {
    name: 'Shadow War: Idle RPG Survival',
    genre: 'Idle · RPG',
    url: 'https://play.google.com/store/apps/details?id=com.shadow.war.legend.slime.idle.rpg.survival.game&hl=en',
    icon: '/game-icons/shadow-war.png',
  },
  {
    name: 'Stickman vs Monster: Idle RPG',
    genre: 'Idle · Action',
    url: 'https://play.google.com/store/apps/details?id=com.stickman.monster.epic.stickman.war.shadow.idle.game&hl=en',
    icon: '/game-icons/stickman-monster.png',
  },
  {
    name: 'Epic Shadow Idle RPG',
    genre: 'Idle · RPG',
    url: 'https://play.google.com/store/apps/details?id=com.tsh012.cyber.war.idle.rpg.games&hl=en',
    icon: '/game-icons/epic-shadow.png',
  },
  {
    name: 'Space War Idle RPG',
    genre: 'Idle · Strategy',
    url: 'https://play.google.com/store/apps/details?id=com.zitga.multiverse.war.idle.star.trek.game&hl=en',
    icon: '/game-icons/space-war.png',
  },
]

export default function Home({ setActive }) {
  const { t, i18n } = useTranslation()

  // ── Text FX hero title ──
  // ponytail: the engine spans every UTF-16 unit, which splits astral emoji into
  // broken halves — so keep any trailing pictograph (👋) outside the animated span.
  const fullTitle = t('home.greeting.title')
  const m = fullTitle.match(/^(.*?)(\s*\p{Extended_Pictographic}[\p{Extended_Pictographic}️‍]*\s*)$/u)
  const titleWords = m ? m[1] : fullTitle
  const titleTrail = m ? m[2] : ''
  const titleRef = useRef(null)
  useEffect(() => {
    const el = titleRef.current
    if (!el || !window.TextFX) return            // engine loads from index.html; absent in tests
    window.TextFX.mount(el)                       // reads data-textfx, rebuilds as per-char spans
    return () => window.TextFX.destroy(el)
  }, [titleWords])

  return (
    <div className={styles.page}>

      {/* ── Hero ── */}
      <section className={`${styles.heroRow} fade-up`}>
        <div>
          <span className={styles.greetKicker}>{t('home.greeting.kicker')}</span>
          <h1 className={styles.greetTitle}>
            {/* keyed by language so a locale switch replaces the span outright
                instead of letting React reconcile the engine-mutated DOM */}
            <span key={i18n.language} ref={titleRef} className="textfx" data-textfx={`[wave]${titleWords}[/]`}>
              {titleWords}
            </span>
            {titleTrail}
          </h1>
          <p className={styles.tagline}>{t('home.greeting.tagline')}</p>
          <div className={styles.currentlyBlock}>
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
              <div
                key={skill.name}
                className={skill.former ? styles.skillChipFormer : styles.skillChip}
              >
                <img src={skill.icon} alt="" className={styles.skillIcon} />
                <span className={styles.skillName}>{skill.name}</span>
                <span className={styles.skillLevel}>
                  {skill.level}{skill.former ? ' ↩' : ''}
                </span>
              </div>
            ))}
          </div>
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

      {/* ── About me (condensed) ── */}
      <section className={styles.section}>
        <SectionTitle index="04" title={t('home.about.title')} sub={t('home.about.sub')} />

        <div className={styles.pivotBox}>
          <span className={styles.pivotArrow}>&#8599;</span>
          <div>
            <span className={styles.pivotLabel}>{t('home.about.pivot_label')}</span>
            <p className={styles.pivotText}>{t('home.about.pivot_text')}</p>
          </div>
        </div>

        <div className={styles.thinkBox}>
          <div>
            <span className={styles.thinkLabel}>{t('home.about.think_label')}</span>
            <p className={styles.thinkText}>{t('home.about.think_text')}</p>
          </div>
        </div>
      </section>

      {/* ── Shipped Games ── */}
      <section className={styles.section}>
        <SectionTitle index="05" title={t('home.games.title')} sub={t('home.games.sub')} />
        <div className={styles.gameShowcaseGrid}>
          {SHOWCASE_GAMES.map(game => (
            <a
              key={game.name}
              href={game.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.gameShowcaseCard}
            >
              <img src={game.icon} alt={game.name} width={80} height={80} className={styles.gameShowcaseCanvas} />
              <span className={styles.gameShowcaseName}>{game.name}</span>
              <span className={styles.gameShowcaseGenre}>{game.genre}</span>
              <span className={styles.gameShowcaseCta}>{t('home.games.cta')}</span>
            </a>
          ))}
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
