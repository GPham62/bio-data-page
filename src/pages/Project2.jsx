import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, Legend, Cell, ReferenceLine,
} from 'recharts'
import StatCard     from '../components/StatCard.jsx'
import SectionTitle from '../components/SectionTitle.jsx'
import ChartCard    from '../components/ChartCard.jsx'
import {
  stats, groupSizes, retention1Data, retention7Data,
  bootstrapData, gameRoundsData, kaggleUrl, colabUrl,
} from '../data/project2.js'
import styles from './Project2.module.css'

const Tip = ({ active, payload, label, prefix = '', suffix = '' }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#0d1117', border: '1px solid #21262d',
      padding: '8px 12px', borderRadius: 6, fontFamily: 'var(--mono)', fontSize: 11,
    }}>
      <p style={{ color: '#7d8590', marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || '#ff6b35' }}>
          {p.name}: <strong>{prefix}{p.value?.toLocaleString()}{suffix}</strong>
        </p>
      ))}
    </div>
  )
}

const fmt = (v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v

export default function Project2({ setActive }) {
  const { t } = useTranslation()

  return (
    <div className={styles.page} style={{ position: 'relative' }}>
      <button className="prev-btn" onClick={() => setActive('p1')}>
        {t('nav.p1')}
      </button>
      <button className="next-btn" onClick={() => setActive('p3')}>
        {t('nav.p3')}
      </button>

      {/* Hero */}
      <section className={`${styles.hero} fade-up`}>
        <div className={styles.heroMeta}>
          <span className={styles.tag}>{t('p2.tag')}</span>
          <span className={styles.tag} style={{ borderColor: 'rgba(0,204,150,0.3)', color: 'var(--green)' }}>
            {t('p2.tag2')}
          </span>
        </div>
        <h1 className={styles.heroTitle}>
          {t('p2.title1')}<br />
          <span className={styles.heroAccent}>{t('p2.title2')}</span>
        </h1>
        <p className={styles.heroSub}>{t('p2.sub')}</p>
        <div className={styles.heroStack}>
          {['Python', 'Pandas', 'SciPy', 'NumPy', 'Bootstrap Testing', 'Chi-Square'].map(tech => (
            <span key={tech} className={styles.pill}>{tech}</span>
          ))}
        </div>
        <div className={styles.linkRow}>
          <a className={styles.kaggleLink} href={kaggleUrl} target="_blank" rel="noopener noreferrer">
            {t('p2.kaggle_link')} <span aria-hidden>↗</span>
          </a>
          <a className={styles.colabLink} href={colabUrl} target="_blank" rel="noopener noreferrer">
            {t('p2.colab_link')} <span aria-hidden>↗</span>
          </a>
        </div>
      </section>

      {/* KPIs */}
      <section className={styles.kpiRow}>
        <StatCard label={t('p2.kpi_players')}   value="90.2K"  sub={t('p2.kpi_players_sub')}   accent="var(--accent2)" delay={0.05} />
        <StatCard label={t('p2.kpi_ret1')}      value="44.5%"  sub={t('p2.kpi_ret1_sub')}      accent="var(--green)"   delay={0.10} />
        <StatCard label={t('p2.kpi_ret7')}      value="18.6%"  sub={t('p2.kpi_ret7_sub')}      accent="var(--purple)"  delay={0.15} />
        <StatCard label={t('p2.kpi_pvalue')}    value="0.002"  sub={t('p2.kpi_pvalue_sub')}    accent="var(--accent2)" delay={0.20} />
      </section>

      {/* Section 1: Experiment Design */}
      <section className={styles.section}>
        <SectionTitle index="01" title={t('p2.s1_title')} sub={t('p2.s1_sub')} />
        <div className={styles.grid1}>
          <ChartCard title={t('p2.chart_groups')} sub={t('p2.chart_groups_sub')} delay={0.05}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={groupSizes} margin={{ left: 0, right: 20, top: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2530" horizontal={false} />
                <XAxis dataKey="group" tick={{ fill: '#cdd9e5', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={fmt} tick={{ fill: '#636e7b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<Tip />} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  <Cell fill="#ff6b35" />
                  <Cell fill="#a371f7" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
        <div className={styles.insight}>
          <span className={styles.insightLabel}>{t('p2.insight_label')}</span>
          <p className={styles.insightText} dangerouslySetInnerHTML={{ __html: t('p2.s1_insight') }} />
        </div>
      </section>

      {/* Section 2: Retention Analysis */}
      <section className={styles.section}>
        <SectionTitle index="02" title={t('p2.s2_title')} sub={t('p2.s2_sub')} />
        <div className={styles.grid2}>
          <ChartCard title={t('p2.chart_ret1')} sub={t('p2.chart_ret1_sub')} delay={0.05}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={retention1Data} margin={{ left: 0, right: 20, top: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2530" horizontal={false} />
                <XAxis dataKey="group" tick={{ fill: '#cdd9e5', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[42, 46]} tickFormatter={v => `${v}%`} tick={{ fill: '#636e7b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<Tip suffix="%" />} />
                <Bar dataKey="rate" name="Retention" radius={[4, 4, 0, 0]}>
                  <Cell fill="#ff6b35" />
                  <Cell fill="#a371f7" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title={t('p2.chart_ret7')} sub={t('p2.chart_ret7_sub')} delay={0.1}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={retention7Data} margin={{ left: 0, right: 20, top: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2530" horizontal={false} />
                <XAxis dataKey="group" tick={{ fill: '#cdd9e5', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[17, 20]} tickFormatter={v => `${v}%`} tick={{ fill: '#636e7b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<Tip suffix="%" />} />
                <Bar dataKey="rate" name="Retention" radius={[4, 4, 0, 0]}>
                  <Cell fill="#ff6b35" />
                  <Cell fill="#a371f7" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
        <div className={styles.note}>
          <span className={styles.noteIcon}>ℹ</span>
          <p dangerouslySetInnerHTML={{ __html: t('p2.note_retention') }} />
        </div>
        <div className={styles.insight}>
          <span className={styles.insightLabel}>{t('p2.insight_label')}</span>
          <p className={styles.insightText} dangerouslySetInnerHTML={{ __html: t('p2.s2_insight') }} />
        </div>
      </section>

      {/* Section 3: Bootstrap Analysis */}
      <section className={styles.section}>
        <SectionTitle index="03" title={t('p2.s3_title')} sub={t('p2.s3_sub')} />
        <div className={styles.grid1}>
          <ChartCard title={t('p2.chart_bootstrap')} sub={t('p2.chart_bootstrap_sub')} delay={0.05}>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={bootstrapData} margin={{ left: 0, right: 20, top: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2530" />
                <XAxis
                  dataKey="diff"
                  tickFormatter={v => `${v.toFixed(1)}%`}
                  tick={{ fill: '#636e7b', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis tick={{ fill: '#636e7b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<Tip suffix="%" />} />
                <ReferenceLine x={0} stroke="#636e7b" strokeDasharray="3 3" />
                <Area
                  type="monotone"
                  dataKey="count"
                  name="Frequency"
                  stroke="#ff6b35"
                  fill="rgba(255,107,53,0.2)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
        <div className={styles.note}>
          <span className={styles.noteIcon}>ℹ</span>
          <p dangerouslySetInnerHTML={{ __html: t('p2.note_bootstrap') }} />
        </div>
        <div className={styles.insight}>
          <span className={styles.insightLabel}>{t('p2.insight_label')}</span>
          <p className={styles.insightText} dangerouslySetInnerHTML={{ __html: t('p2.s3_insight') }} />
        </div>
      </section>

      {/* Section 4: Game Rounds Distribution */}
      <section className={styles.section}>
        <SectionTitle index="04" title={t('p2.s4_title')} sub={t('p2.s4_sub')} />
        <div className={styles.grid1}>
          <ChartCard title={t('p2.chart_rounds')} sub={t('p2.chart_rounds_sub')} delay={0.05}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={gameRoundsData} margin={{ left: 0, right: 20, top: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2530" horizontal={false} />
                <XAxis dataKey="range" tick={{ fill: '#cdd9e5', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={fmt} tick={{ fill: '#636e7b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<Tip />} />
                <Legend wrapperStyle={{ fontSize: 11, color: '#636e7b' }} />
                <Bar dataKey="gate30" name="Gate 30" fill="#ff6b35" radius={[3, 3, 0, 0]} />
                <Bar dataKey="gate40" name="Gate 40" fill="#a371f7" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
        <div className={styles.insight}>
          <span className={styles.insightLabel}>{t('p2.insight_label')}</span>
          <p className={styles.insightText} dangerouslySetInnerHTML={{ __html: t('p2.s4_insight') }} />
        </div>
      </section>

      {/* Conclusion */}
      <section className={styles.section}>
        <div className={styles.conclusion}>
          <h3 className={styles.conclusionTitle}>{t('p2.conclusion_title')}</h3>
          <p className={styles.conclusionText} dangerouslySetInnerHTML={{ __html: t('p2.conclusion_text') }} />
        </div>
      </section>
    </div>
  )
}
