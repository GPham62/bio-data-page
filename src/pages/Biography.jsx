import React from 'react'
import { useTranslation } from 'react-i18next'
import styles from './Biography.module.css'

export default function Biography({ setActive }) {
  const { t } = useTranslation()
  const skills = t('bio.skills', { returnObjects: true })

  return (
    <div className={styles.page} style={{ position: 'relative' }}>
      <button className="prev-btn" onClick={() => setActive('home')}>
        {t('nav.home')}
      </button>
      <button className="next-btn" onClick={() => setActive('p1')}>
        {t('nav.p1')}
      </button>

      {/* Hero */}
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

      {/* Section 01 — Technical Skills */}
      <section className={`${styles.section} fade-up`} style={{ animationDelay: '0.1s' }}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionNum}>01</span>
          <div>
            <div className={styles.sectionTitle}>{t('bio.s1_title')}</div>
            <div className={styles.sectionSub}>{t('bio.s1_sub')}</div>
          </div>
        </div>

        <div className={styles.skillsBox}>
          <div className={styles.pills}>
            {Array.isArray(skills) && skills.map((s) => (
              <span key={s} className={styles.pill}>{s}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Section 02 — Background */}
      <section className={`${styles.section} fade-up`} style={{ animationDelay: '0.2s' }}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionNum}>02</span>
          <div>
            <div className={styles.sectionTitle}>{t('bio.s2_title')}</div>
            <div className={styles.sectionSub}>{t('bio.s2_sub')}</div>
          </div>
        </div>

        <div className={styles.pivotBox}>
          <span className={styles.pivotArrow}>&#8599;</span>
          <div>
            <span className={styles.pivotLabel}>{t('bio.pivot_label')}</span>
            <p className={styles.pivotText}>
              {t('bio.pivot_text')}{' '}
              <a
                href="https://play.google.com/store/apps/details?id=com.tsh012.cyber.war.idle.rpg.games&hl=en"
                target="_blank"
                rel="noopener noreferrer"
              >Epic Shadow</a>
              {' & '}
              <a
                href="https://play.google.com/store/apps/details?id=com.zitga.multiverse.war.idle.star.trek.game&hl=en"
                target="_blank"
                rel="noopener noreferrer"
              >Space War</a>
            </p>
          </div>
        </div>
      </section>

      {/* Section 03 — Contact */}
      <section className={`${styles.section} fade-up`} style={{ animationDelay: '0.3s' }}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionNum}>03</span>
          <div>
            <div className={styles.sectionTitle}>{t('bio.s3_title')}</div>
            <div className={styles.sectionSub}>{t('bio.s3_sub')}</div>
          </div>
        </div>

        <div className={styles.contactRow}>
          <a
            href="https://github.com/GPham62"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.contactCard}
          >
            <span className={styles.contactIcon}>GH</span>
            <div>
              <span className={styles.contactLabel}>GitHub</span>
              <span className={styles.contactValue}>GPham62</span>
            </div>
          </a>
          <a
            href="https://www.linkedin.com/in/tuananhpham6296/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.contactCard}
          >
            <span className={styles.contactIcon}>LI</span>
            <div>
              <span className={styles.contactLabel}>LinkedIn</span>
              <span className={styles.contactValue}>tuananhpham6296</span>
            </div>
          </a>
          <a
            href="mailto:ptuananh196@gmail.com"
            className={styles.contactCard}
          >
            <span className={styles.contactIcon}>@</span>
            <div>
              <span className={styles.contactLabel}>Email</span>
              <span className={styles.contactValue}>ptuananh196</span>
            </div>
          </a>
        </div>
      </section>
    </div>
  )
}
