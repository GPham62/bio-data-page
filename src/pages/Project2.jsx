import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, Legend, Cell, ReferenceLine,
} from 'recharts'
import StatCard     from '../components/StatCard.jsx'
import SectionTitle from '../components/SectionTitle.jsx'
import ChartCard    from '../components/ChartCard.jsx'
import ChartTooltip from '../components/ChartTooltip.jsx'
import InsightBlock from '../components/InsightBlock.jsx'
import SqlCard      from '../components/SqlCard.jsx'
import Note         from '../components/Note.jsx'
import { fmt } from '../utils/formatters.js'
import { gridProps, axisMuted, axisStrong, axisStrong11 } from '../utils/chartTheme.js'
import {
  stats, groupSizes, retention1Data, retention7Data,
  bootstrapData, gameRoundsData, kaggleUrl, sqlUrl,
} from '../data/project2.js'
import styles from './Project2.module.css'

const SQL_SNIPPET = `-- Retention rate by gate group (1-day and 7-day)
SELECT
    version                                          AS gate_group,
    COUNT(*)                                         AS total_players,
    ROUND(AVG(retention_1::INTEGER) * 100, 2)        AS retention_1day_pct,
    ROUND(AVG(retention_7::INTEGER) * 100, 2)        AS retention_7day_pct,
    SUM(retention_1::INTEGER)                        AS returned_day1,
    COUNT(*) - SUM(retention_1::INTEGER)             AS not_returned_day1,
    SUM(retention_7::INTEGER)                        AS returned_day7,
    COUNT(*) - SUM(retention_7::INTEGER)             AS not_returned_day7
FROM  cookie_cats
WHERE version IN ('gate_30', 'gate_40')
GROUP BY version
ORDER BY version;`

export default function Project2({ setActive }) {
  const { t } = useTranslation()

  return (
    <div className="projectPage" style={{ position: 'relative' }}>
      <button className="prev-btn" onClick={() => setActive('p1')}>
        {t('nav.p1')}
      </button>
      <button className="next-btn" onClick={() => setActive('p3')}>
        {t('nav.p3')}
      </button>

      {/* Hero */}
      <section className="projectHero fade-up">
        <div className="projectHeroMeta">
          <span className={styles.tag}>{t('p2.tag')}</span>
          <span className={styles.tag} style={{ borderColor: 'rgba(0,204,150,0.3)', color: 'var(--green)' }}>
            {t('p2.tag2')}
          </span>
        </div>
        <h1 className="projectHeroTitle">
          {t('p2.title1')}<br />
          <span className={styles.heroAccent}>{t('p2.title2')}</span>
        </h1>
        <p className="projectHeroSub">{t('p2.sub')}</p>
        <div className="projectHeroStack">
          {['Python', 'Pandas', 'SciPy', 'NumPy', 'Bootstrap Testing', 'Chi-Square'].map(tech => (
            <span key={tech} className="projectPill">{tech}</span>
          ))}
        </div>
        <div className={styles.linkRow}>
          <a className={styles.kaggleLink} href={kaggleUrl} target="_blank" rel="noopener noreferrer">
            {t('p2.kaggle_link')} <span aria-hidden>↗</span>
          </a>
          <a className={styles.sqlLink} href={sqlUrl} target="_blank" rel="noopener noreferrer">
            {t('p2.sql_link')} <span aria-hidden>↗</span>
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
      <section className="projectSection">
        <SectionTitle index="01" title={t('p2.s1_title')} sub={t('p2.s1_sub')} />
        <div className="projectGrid1">
          <ChartCard title={t('p2.chart_groups')} sub={t('p2.chart_groups_sub')} delay={0.05}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={groupSizes} margin={{ left: 0, right: 20, top: 10, bottom: 5 }}>
                <CartesianGrid {...gridProps} horizontal={false} />
                <XAxis dataKey="group" {...axisStrong11} />
                <YAxis tickFormatter={fmt} {...axisMuted} />
                <Tooltip content={<ChartTooltip color="#ff6b35" />} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  <Cell fill="#ff6b35" />
                  <Cell fill="#a371f7" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
        <InsightBlock label={t('p2.insight_label')} text={t('p2.s1_insight')} accent="var(--accent2)" />
      </section>

      {/* Section 2: Retention Analysis */}
      <section className="projectSection">
        <SectionTitle index="02" title={t('p2.s2_title')} sub={t('p2.s2_sub')} />
        <div className="projectGrid2">
          <ChartCard title={t('p2.chart_ret1')} sub={t('p2.chart_ret1_sub')} delay={0.05}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={retention1Data} margin={{ left: 0, right: 20, top: 10, bottom: 5 }}>
                <CartesianGrid {...gridProps} horizontal={false} />
                <XAxis dataKey="group" {...axisStrong11} />
                <YAxis domain={[42, 46]} tickFormatter={v => `${v}%`} {...axisMuted} />
                <Tooltip content={<ChartTooltip suffix="%" color="#ff6b35" />} />
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
                <CartesianGrid {...gridProps} horizontal={false} />
                <XAxis dataKey="group" {...axisStrong11} />
                <YAxis domain={[17, 20]} tickFormatter={v => `${v}%`} {...axisMuted} />
                <Tooltip content={<ChartTooltip suffix="%" color="#ff6b35" />} />
                <Bar dataKey="rate" name="Retention" radius={[4, 4, 0, 0]}>
                  <Cell fill="#ff6b35" />
                  <Cell fill="#a371f7" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
        <Note text={t('p2.note_retention')} accent="var(--accent2)" />
        <SqlCard title={t('p2.sql_card_title')} code={SQL_SNIPPET} href={sqlUrl} linkLabel={t('p2.sql_link')} accent="var(--accent2)" />
        <InsightBlock label={t('p2.insight_label')} text={t('p2.s2_insight')} accent="var(--accent2)" />
      </section>

      {/* Section 3: Bootstrap Analysis */}
      <section className="projectSection">
        <SectionTitle index="03" title={t('p2.s3_title')} sub={t('p2.s3_sub')} />
        <div className="projectGrid1">
          <ChartCard title={t('p2.chart_bootstrap')} sub={t('p2.chart_bootstrap_sub')} delay={0.05}>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={bootstrapData} margin={{ left: 0, right: 20, top: 10, bottom: 5 }}>
                <CartesianGrid {...gridProps} />
                <XAxis dataKey="diff" tickFormatter={v => `${v.toFixed(1)}%`} {...axisMuted} />
                <YAxis {...axisMuted} />
                <Tooltip content={<ChartTooltip suffix="%" color="#ff6b35" />} />
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
        <Note text={t('p2.note_bootstrap')} accent="var(--accent2)" />
        <InsightBlock label={t('p2.insight_label')} text={t('p2.s3_insight')} accent="var(--accent2)" />
      </section>

      {/* Section 4: Game Rounds Distribution */}
      <section className="projectSection">
        <SectionTitle index="04" title={t('p2.s4_title')} sub={t('p2.s4_sub')} />
        <div className="projectGrid1">
          <ChartCard title={t('p2.chart_rounds')} sub={t('p2.chart_rounds_sub')} delay={0.05}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={gameRoundsData} margin={{ left: 0, right: 20, top: 10, bottom: 5 }}>
                <CartesianGrid {...gridProps} horizontal={false} />
                <XAxis dataKey="range" {...axisStrong} />
                <YAxis tickFormatter={fmt} {...axisMuted} />
                <Tooltip content={<ChartTooltip color="#ff6b35" />} />
                <Legend wrapperStyle={{ fontSize: '0.6875rem', color: '#636e7b' }} />
                <Bar dataKey="gate30" name="Gate 30" fill="#ff6b35" radius={[3, 3, 0, 0]} />
                <Bar dataKey="gate40" name="Gate 40" fill="#a371f7" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
        <InsightBlock label={t('p2.insight_label')} text={t('p2.s4_insight')} accent="var(--accent2)" />
      </section>

      {/* Conclusion */}
      <section className="projectSection">
        <div className={styles.conclusion}>
          <h3 className={styles.conclusionTitle}>{t('p2.conclusion_title')}</h3>
          <p className={styles.conclusionText} dangerouslySetInnerHTML={{ __html: t('p2.conclusion_text') }} />
        </div>
      </section>
    </div>
  )
}
