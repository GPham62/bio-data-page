import React, { useEffect, useRef } from 'react'
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

// 16×16 grid, S=5 → 80px. Canvas is 160×160 (2× DPR), scaled with ctx.scale(2,2).
const S = 5

function px(ctx, x, y, color) {
  ctx.fillStyle = color
  ctx.fillRect(x * S, y * S, S - 1, S - 1)
}

// Space War Idle RPG — pixel spaceship
function drawSpaceWar(ctx) {
  const B = '#5988ff', P = '#a371f7', W = '#ffffff'
  // Nose
  px(ctx, 7, 1, B); px(ctx, 8, 1, B)
  // Upper body
  ;[6, 7, 8, 9].forEach(x => px(ctx, x, 2, B))
  // Cockpit row
  ;[5, 6, 9, 10].forEach(x => px(ctx, x, 3, B))
  px(ctx, 7, 3, W); px(ctx, 8, 3, W)
  // Wings
  for (let x = 2; x <= 13; x++) px(ctx, x, 4, B)
  for (let x = 3; x <= 12; x++) px(ctx, x, 5, B)
  // Lower body
  ;[4, 5, 6, 7, 8, 9, 10, 11].forEach(x => px(ctx, x, 6, B))
  // Engine glow
  ;[5, 6, 9, 10].forEach(x => px(ctx, x, 7, B))
  px(ctx, 7, 7, P); px(ctx, 8, 7, P)
  // Exhaust
  ;[6, 7, 8, 9].forEach(x => px(ctx, x, 8, P))
  px(ctx, 7, 9, P); px(ctx, 8, 9, P)
  px(ctx, 7, 10, P)
}

// Relic Bag: Shadow Hunter — stickman fighter with sword
function drawRelicBag(ctx) {
  const B = '#5988ff', P = '#a371f7', W = '#ffffff', G = '#8b8fa8'
  // Head
  ;[6, 7, 8, 9].forEach(x => px(ctx, x, 1, W))
  ;[5, 10].forEach(x => px(ctx, x, 2, W))
  px(ctx, 6, 2, B); px(ctx, 7, 2, W); px(ctx, 8, 2, W); px(ctx, 9, 2, B)
  ;[5, 10].forEach(x => px(ctx, x, 3, W))
  ;[6, 7, 8, 9].forEach(x => px(ctx, x, 3, W))
  ;[6, 7, 8, 9].forEach(x => px(ctx, x, 4, W))
  // Neck
  px(ctx, 7, 5, W); px(ctx, 8, 5, W)
  // Body
  ;[5, 6, 7, 8, 9, 10].forEach(x => px(ctx, x, 6, B))
  ;[5, 6, 7, 8, 9, 10].forEach(x => px(ctx, x, 7, B))
  // Left arm
  px(ctx, 3, 6, W); px(ctx, 4, 6, W)
  // Right arm + sword
  px(ctx, 11, 6, W); px(ctx, 12, 6, W)
  ;[13, 14, 15].forEach(x => px(ctx, x, 6, P))
  px(ctx, 13, 5, P); px(ctx, 13, 7, P) // crossguard
  // Legs
  ;[5, 6].forEach(x => px(ctx, x, 8, G))
  ;[9, 10].forEach(x => px(ctx, x, 8, G))
  ;[5, 6].forEach(x => px(ctx, x, 9, G))
  ;[9, 10].forEach(x => px(ctx, x, 9, G))
  px(ctx, 5, 10, G); px(ctx, 6, 10, G)
  px(ctx, 9, 10, G); px(ctx, 10, 10, G)
  // Relic bag (left side, purple)
  ;[1, 2, 3, 4].forEach(x => px(ctx, x, 9, P))
  ;[1, 2, 3, 4].forEach(x => px(ctx, x, 10, P))
  ;[1, 2, 3, 4].forEach(x => px(ctx, x, 11, P))
  ;[2, 3].forEach(x => px(ctx, x, 12, P))
}

// Shadow War: Idle RPG — cloaked warrior silhouette
function drawShadowWar(ctx) {
  const P = '#a371f7', B = '#5988ff', D = '#1a0d30', W = '#ffffff'
  // Hood
  ;[5, 6, 7, 8, 9, 10].forEach(x => px(ctx, x, 1, P))
  ;[4, 5, 6, 7, 8, 9, 10, 11].forEach(x => px(ctx, x, 2, P))
  // Face (dark interior)
  ;[4, 5, 6, 7, 8, 9, 10, 11].forEach(x => px(ctx, x, 3, D))
  ;[4, 5, 6, 7, 8, 9, 10, 11].forEach(x => px(ctx, x, 4, D))
  // Glowing eyes (blue)
  px(ctx, 6, 3, B); px(ctx, 7, 3, B)
  px(ctx, 8, 3, B); px(ctx, 9, 3, B)
  // Jaw / chin
  ;[4, 5, 6, 7, 8, 9, 10, 11].forEach(x => px(ctx, x, 5, P))
  // Cloak spreading outward
  ;[5, 6, 7, 8, 9, 10].forEach(x => px(ctx, x, 6, P))
  ;[4, 5, 6, 7, 8, 9, 10, 11].forEach(x => px(ctx, x, 7, P))
  ;[3, 4, 5, 6, 7, 8, 9, 10, 11, 12].forEach(x => px(ctx, x, 8, P))
  ;[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].forEach(x => px(ctx, x, 9, P))
  ;[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].forEach(x => px(ctx, x, 10, P))
  // Feet
  ;[2, 3, 4].forEach(x => px(ctx, x, 11, P))
  ;[11, 12, 13].forEach(x => px(ctx, x, 11, P))
  // Sword glow beneath cloak (blue)
  ;[6, 7, 8, 9].forEach(x => px(ctx, x, 12, B))
  px(ctx, 7, 13, B); px(ctx, 8, 13, B)
  px(ctx, 7, 14, B)
}

function PixelCanvas({ draw }) {
  const ref = useRef(null)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.scale(2, 2)
    draw(ctx)
  }, []) // ponytail: draw fns are module-level constants, stable across renders
  return (
    <canvas
      ref={ref}
      width={160}
      height={160}
      className={styles.gameShowcaseCanvas}
      style={{ width: 80, height: 80 }}
    />
  )
}

const SHOWCASE_GAMES = [
  {
    name: 'Relic Bag: Shadow Hunter',
    genre: 'Puzzle · Action',
    url: 'https://play.google.com/store/apps/details?id=com.TSH014.bag.fight.stickman.shadow.hero.puzzle&hl=en',
    draw: drawRelicBag,
  },
  {
    name: 'Shadow War: Idle RPG Survival',
    genre: 'Idle · RPG',
    url: 'https://play.google.com/store/apps/details?id=com.shadow.war.legend.slime.idle.rpg.survival.game&hl=en',
    draw: drawShadowWar,
  },
  {
    name: 'Space War Idle RPG',
    genre: 'Idle · Strategy',
    url: 'https://play.google.com/store/apps/details?id=com.zitga.multiverse.war.idle.star.trek.game&hl=en',
    draw: drawSpaceWar,
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

      {/* ── Shipped Games ── */}
      <section className={styles.section}>
        <SectionTitle index="03" title={t('home.games.title')} sub={t('home.games.sub')} />
        <div className={styles.gameShowcaseGrid}>
          {SHOWCASE_GAMES.map(game => (
            <a
              key={game.name}
              href={game.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.gameShowcaseCard}
            >
              <PixelCanvas draw={game.draw} />
              <span className={styles.gameShowcaseName}>{game.name}</span>
              <span className={styles.gameShowcaseGenre}>{game.genre}</span>
              <span className={styles.gameShowcaseCta}>{t('home.games.cta')}</span>
            </a>
          ))}
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
        <SectionTitle index="05" title={t('home.portfolio.title')} sub={t('home.portfolio.sub')} />

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
