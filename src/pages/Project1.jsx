import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, Cell,
} from 'recharts'
import StatCard     from '../components/StatCard.jsx'
import SectionTitle from '../components/SectionTitle.jsx'
import ChartCard    from '../components/ChartCard.jsx'
import {
  salaryByTitle, topCountries, remoteByTitle,
  topSkills, monthlyTrend, mlResults, stats, colabUrl,
} from '../data/project1.js'
import styles from './Project1.module.css'

const Tip = ({ active, payload, label, prefix = '', suffix = '' }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#0d1117', border: '1px solid #21262d',
      padding: '8px 12px', borderRadius: 6, fontFamily: 'var(--mono)', fontSize: 11,
    }}>
      <p style={{ color: '#7d8590', marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || '#00e5ff' }}>
          {p.name}: <strong>{prefix}{p.value?.toLocaleString()}{suffix}</strong>
        </p>
      ))}
    </div>
  )
}

const fmt    = (v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v
const fmtUSD = (v) => `$${(v / 1000).toFixed(0)}k`
const pct    = (v) => `${(v * 100).toFixed(0)}%`

// Recharts renders the first datum at the bottom of a vertical bar chart, so
// reverse the most-important-first list to put the strongest driver on top.
const importanceData = [...mlResults.featureImportance].reverse()
const topDriver      = mlResults.featureImportance[0]

export default function Project1({ setActive }) {
  const { t } = useTranslation()

  return (
    <div className={styles.page} style={{ position: 'relative' }}>
      <button className="prev-btn" onClick={() => setActive('bio')}>
        {t('nav.bio')}
      </button>
      <button className="next-btn" onClick={() => setActive('p2')}>
        {t('nav.p2')}
      </button>

      {/* Hero */}
      <section className={`${styles.hero} fade-up`}>
        <div className={styles.heroMeta}>
          <span className={styles.tag}>{t('p1.tag')}</span>
          <span className={styles.tag} style={{ borderColor: 'rgba(0,204,150,0.3)', color: 'var(--green)' }}>
            {t('p1.tag2')}
          </span>
        </div>
        <h1 className={styles.heroTitle}>
          {t('p1.title1')}<br />
          <span className={styles.heroAccent}>{t('p1.title2')}</span>
        </h1>
        <p className={styles.heroSub}>{t('p1.sub')}</p>
        <div className={styles.heroStack}>
          {['Python', 'DuckDB', 'MotherDuck', 'Pandas', 'Plotly', 'Scikit-learn', 'Google Colab'].map(t => (
            <span key={t} className={styles.pill}>{t}</span>
          ))}
        </div>
        <a className={styles.colabLink} href={colabUrl} target="_blank" rel="noopener noreferrer">
          {t('p1.colab_link')} <span aria-hidden>↗</span>
        </a>
      </section>

      {/* KPIs */}
      <section className={styles.kpiRow}>
        <StatCard label={t('p1.kpi_postings')}   value="1.6M"   sub={t('p1.kpi_postings_sub')}   accent="var(--accent)"  delay={0.05} />
        <StatCard label={t('p1.kpi_countries')}  value={stats.countriesCovered} sub={t('p1.kpi_countries_sub')} accent="var(--green)"  delay={0.10} />
        <StatCard label={t('p1.kpi_salary_rec')} value="77K"    sub={t('p1.kpi_salary_rec_sub')} accent="var(--purple)" delay={0.15} />
        <StatCard label={t('p1.kpi_median')}     value="$110K"  sub={t('p1.kpi_median_sub')}     accent="var(--accent2)"delay={0.20} />
        <StatCard label={t('p1.kpi_r2')}         value="80%"    sub={t('p1.kpi_r2_sub')}         accent="var(--green)"  delay={0.25} />
        <StatCard label={t('p1.kpi_skill')}      value="SQL"    sub={t('p1.kpi_skill_sub')}      accent="var(--purple)" delay={0.30} />
      </section>

      {/* Section 1: Salary */}
      <section className={styles.section}>
        <SectionTitle index="01" title={t('p1.s1_title')} sub={t('p1.s1_sub')} />
        <div className={styles.grid2}>
          <ChartCard title={t('p1.chart_salary')} sub={t('p1.chart_salary_sub')} delay={0.05}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={salaryByTitle} layout="vertical" margin={{ left: 0, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2530" horizontal={false} />
                <XAxis type="number" tickFormatter={fmtUSD} tick={{ fill: '#636e7b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="title" width={130} tick={{ fill: '#cdd9e5', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<Tip prefix="$" />} />
                <Bar dataKey="salary" radius={[0, 3, 3, 0]}>
                  {salaryByTitle.map((_, i) => (
                    <Cell key={i} fill={i < 3 ? '#00cc96' : i < 6 ? '#00e5ff' : '#636e7b'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title={t('p1.chart_remote')} sub={t('p1.chart_remote_sub')} delay={0.1}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={remoteByTitle} layout="vertical" margin={{ left: 0, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2530" horizontal={false} />
                <XAxis type="number" tickFormatter={v => `${v}%`} tick={{ fill: '#636e7b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="title" width={130} tick={{ fill: '#cdd9e5', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<Tip suffix="%" />} />
                <Bar dataKey="pct" fill="#a371f7" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
        <div className={styles.insight}>
          <span className={styles.insightLabel}>{t('p1.insight_label')}</span>
          <p className={styles.insightText} dangerouslySetInnerHTML={{ __html: t('p1.s1_insight') }} />
        </div>
      </section>

      {/* Section 2: Trends */}
      <section className={styles.section}>
        <SectionTitle index="02" title={t('p1.s2_title')} sub={t('p1.s2_sub')} />
        <div className={styles.grid1}>
          <ChartCard title={t('p1.chart_trend')} sub={t('p1.chart_trend_sub')} delay={0.05}>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={monthlyTrend} margin={{ left: 0, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2530" />
                <XAxis dataKey="month" tick={{ fill: '#636e7b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="l" tickFormatter={fmt} tick={{ fill: '#636e7b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="r" orientation="right" tickFormatter={v => `${v}%`} tick={{ fill: '#636e7b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<Tip />} />
                <Legend wrapperStyle={{ fontSize: 11, color: '#636e7b' }} />
                <Line yAxisId="l" type="monotone" dataKey="postings" name="Postings" stroke="#00e5ff" strokeWidth={2} dot={false} />
                <Line yAxisId="r" type="monotone" dataKey="remote"   name="Remote %"  stroke="#00cc96" strokeWidth={2} dot={false} strokeDasharray="5 3" />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
        <div className={styles.insight}>
          <span className={styles.insightLabel}>{t('p1.insight_label')}</span>
          <p className={styles.insightText} dangerouslySetInnerHTML={{ __html: t('p1.s2_insight') }} />
        </div>
      </section>

      {/* Section 3: Skills + Geo */}
      <section className={styles.section}>
        <SectionTitle index="03" title={t('p1.s3_title')} sub={t('p1.s3_sub')} />
        <div className={styles.grid2}>
          <ChartCard title={t('p1.chart_skills')} sub={t('p1.chart_skills_sub')} delay={0.05}>
            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={topSkills} layout="vertical" margin={{ left: 0, right: 24, top: 4, bottom: 4 }} barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2530" horizontal={false} />
                <XAxis type="number" tickFormatter={fmt} tick={{ fill: '#636e7b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="skill" width={72} tick={{ fill: '#cdd9e5', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<Tip />} />
                <Bar dataKey="count" fill="#00e5ff" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title={t('p1.chart_countries')} sub={t('p1.chart_countries_sub')} delay={0.1}>
            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={topCountries} layout="vertical" margin={{ left: 0, right: 24, top: 4, bottom: 4 }} barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2530" horizontal={false} />
                <XAxis type="number" tickFormatter={fmt} tick={{ fill: '#636e7b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="country" width={100} tick={{ fill: '#cdd9e5', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<Tip />} />
                <Bar dataKey="postings" fill="#ff6b35" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
        <div className={styles.insight}>
          <span className={styles.insightLabel}>{t('p1.insight_label')}</span>
          <p className={styles.insightText} dangerouslySetInnerHTML={{ __html: t('p1.s3_insight') }} />
        </div>
      </section>

      {/* Section 4: ML */}
      <section className={styles.section}>
        <SectionTitle index="04" title={t('p1.s4_title')} sub={t('p1.s4_sub')} />

        <div className={styles.mlMeta}>
          <div className={styles.mlScore} style={{ '--ml-accent': 'var(--accent)' }}>
            <span className={styles.mlScoreLabel}>{t('p1.ml_acc_label')}</span>
            <span className={styles.mlScoreVal}>{pct(mlResults.accuracy)}</span>
            <span className={styles.mlScoreSub}>{t('p1.ml_acc_sub')}</span>
          </div>
          <div className={styles.mlScore} style={{ '--ml-accent': 'var(--accent2)' }}>
            <span className={styles.mlScoreLabel}>ROC-AUC</span>
            <span className={styles.mlScoreVal}>{mlResults.rocAuc}</span>
            <span className={styles.mlScoreSub}>{t('p1.ml_auc_sub')}</span>
          </div>
          <div className={styles.mlScore} style={{ '--ml-accent': 'var(--purple)' }}>
            <span className={styles.mlScoreLabel}>F1</span>
            <span className={styles.mlScoreVal}>{mlResults.f1}</span>
            <span className={styles.mlScoreSub}>{t('p1.ml_f1_sub', { precision: mlResults.precision, recall: mlResults.recall })}</span>
          </div>
          <div className={styles.mlScore} style={{ '--ml-accent': 'var(--green)' }}>
            <span className={styles.mlScoreLabel}>{t('p1.ml_base_label')}</span>
            <span className={styles.mlScoreVal}>{pct(mlResults.baseline)}</span>
            <span className={styles.mlScoreSub}>{t('p1.ml_base_sub')}</span>
          </div>
        </div>

        <ChartCard title={t('p1.chart_features')} sub={t('p1.chart_features_sub')} delay={0.1}>
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={importanceData} layout="vertical" margin={{ left: 0, right: 30 }} barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2530" horizontal={false} />
              <XAxis type="number" tickFormatter={v => `${v}%`} tick={{ fill: '#636e7b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="feature" width={130} tick={{ fill: '#cdd9e5', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<Tip suffix="%" />} />
              <Bar dataKey="importance" radius={[0, 3, 3, 0]}>
                {importanceData.map((d, i) => <Cell key={i} fill={d.direction > 0 ? '#00cc96' : '#ef553b'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <div className={styles.mlNote}>
          <span className={styles.mlNoteIcon}>ℹ</span>
          <p dangerouslySetInnerHTML={{ __html: t('p1.ml_note') }} />
        </div>
        <div className={styles.insight}>
          <span className={styles.insightLabel}>{t('p1.insight_label')}</span>
          <p className={styles.insightText} dangerouslySetInnerHTML={{ __html: t('p1.s4_insight') }} />
        </div>
      </section>

      {/* Section 5: Recommendations */}
      <section className={styles.section}>
        <SectionTitle index="05" title={t('p1.s5_title')} sub={t('p1.s5_sub')} />
        <div className={styles.recsBox}>
          <h3 className={styles.recsTitle}>{t('p1.recs_title')}</h3>
          <ul className={styles.recsList}>
            {t('p1.recs_items', { returnObjects: true }).map((item, i) => (
              <li key={i} className={styles.recsItem}>
                <span className={styles.recsNum}>0{i + 1}</span>
                <span dangerouslySetInnerHTML={{ __html: item }} />
              </li>
            ))}
          </ul>
        </div>
      </section>

    </div>
  )
}
