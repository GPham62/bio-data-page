import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, Cell, ScatterChart, Scatter, ZAxis,
} from 'recharts'
import StatCard     from '../components/StatCard.jsx'
import SectionTitle from '../components/SectionTitle.jsx'
import ChartCard    from '../components/ChartCard.jsx'
import {
  stats, monthlyRevenue, topCountries, rfmSegments,
  rfmScatter, cohortData, kaggleUrl,
} from '../data/project3.js'
import styles from './Project3.module.css'

const SEGMENT_COLORS = {
  'Champions': '#00cc96',
  'Loyal': '#00e5ff',
  'Potential Loyal': '#a371f7',
  'At Risk': '#ff6b35',
  'Hibernating': '#636e7b',
  'Lost': '#ef553b',
}

const Tip = ({ active, payload, label, prefix = '', suffix = '' }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#0d1117', border: '1px solid #21262d',
      padding: '8px 12px', borderRadius: 6, fontFamily: 'var(--mono)', fontSize: 11,
    }}>
      <p style={{ color: '#7d8590', marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || '#00cc96' }}>
          {p.name}: <strong>{prefix}{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}{suffix}</strong>
        </p>
      ))}
    </div>
  )
}

const ScatterTip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload
  if (!d) return null
  return (
    <div style={{
      background: '#0d1117', border: '1px solid #21262d',
      padding: '8px 12px', borderRadius: 6, fontFamily: 'var(--mono)', fontSize: 11,
    }}>
      <p style={{ color: SEGMENT_COLORS[d.segment] || '#00cc96', marginBottom: 4 }}>{d.segment}</p>
      <p style={{ color: '#cdd9e5' }}>Recency: <strong>{d.recency} days</strong></p>
      <p style={{ color: '#cdd9e5' }}>Frequency: <strong>{d.frequency} orders</strong></p>
      <p style={{ color: '#cdd9e5' }}>Revenue: <strong>${d.monetary.toLocaleString()}</strong></p>
    </div>
  )
}

const fmt     = (v) => v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v
const fmtUSD  = (v) => `$${fmt(v)}`

function CohortHeatmap({ data, t }) {
  const months = ['M0','M1','M2','M3','M4','M5','M6','M7','M8','M9','M10','M11','M12']
  const cols = data[0] ? Object.keys(data[0]).filter(k => k !== 'cohort').length : 0

  const getColor = (val) => {
    if (val === undefined || val === null) return 'transparent'
    if (val >= 100) return 'rgba(0,204,150,0.5)'
    if (val >= 30) return 'rgba(0,204,150,0.35)'
    if (val >= 20) return 'rgba(0,204,150,0.22)'
    if (val >= 10) return 'rgba(0,229,255,0.18)'
    return 'rgba(99,110,123,0.15)'
  }

  return (
    <div className={styles.heatmapWrap}>
      <div className={styles.heatmapTitle}>{t('p3.chart_cohort')}</div>
      <div className={styles.heatmapSub}>{t('p3.chart_cohort_sub')}</div>
      <div className={styles.heatmap} style={{ gridTemplateColumns: `100px repeat(${cols}, 1fr)` }}>
        <div className={styles.heatmapHeader}>
          <div className={styles.heatmapHeaderCell}>{t('p3.cohort_label')}</div>
          {months.slice(0, cols).map(m => (
            <div key={m} className={styles.heatmapHeaderCell}>{m}</div>
          ))}
        </div>
        {data.map(row => (
          <div key={row.cohort} className={styles.heatmapRow}>
            <div className={styles.heatmapLabel}>{row.cohort}</div>
            {months.slice(0, cols).map(m => {
              const key = m.toLowerCase()
              const val = row[key]
              return (
                <div
                  key={m}
                  className={styles.heatmapCell}
                  style={{ background: getColor(val) }}
                >
                  {val !== undefined ? `${val}%` : ''}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Project3({ setActive }) {
  const { t } = useTranslation()

  return (
    <div className={styles.page} style={{ position: 'relative' }}>
      <button className="prev-btn" onClick={() => setActive('p2')}>
        {t('nav.p2')}
      </button>
      <button className="next-btn" onClick={() => setActive('home')}>
        {t('nav.home')}
      </button>

      {/* Hero */}
      <section className={`${styles.hero} fade-up`}>
        <div className={styles.heroMeta}>
          <span className={styles.tag}>{t('p3.tag')}</span>
          <span className={styles.tag} style={{ borderColor: 'rgba(163,113,247,0.3)', color: 'var(--purple)' }}>
            {t('p3.tag2')}
          </span>
        </div>
        <h1 className={styles.heroTitle}>
          {t('p3.title1')}<br />
          <span className={styles.heroAccent}>{t('p3.title2')}</span>
        </h1>
        <p className={styles.heroSub}>{t('p3.sub')}</p>
        <div className={styles.heroStack}>
          {['SQL', 'Python', 'Pandas', 'Recharts', 'RFM Analysis', 'Cohort Analysis'].map(tech => (
            <span key={tech} className={styles.pill}>{tech}</span>
          ))}
        </div>
        <a className={styles.kaggleLink} href={kaggleUrl} target="_blank" rel="noopener noreferrer">
          {t('p3.kaggle_link')} <span aria-hidden>↗</span>
        </a>
      </section>

      {/* KPIs */}
      <section className={styles.kpiRow}>
        <StatCard label={t('p3.kpi_transactions')} value="542K"    sub={t('p3.kpi_transactions_sub')} accent="var(--green)"  delay={0.05} />
        <StatCard label={t('p3.kpi_customers')}    value="4,372"   sub={t('p3.kpi_customers_sub')}    accent="var(--accent)"  delay={0.10} />
        <StatCard label={t('p3.kpi_revenue')}      value="$8.9M"   sub={t('p3.kpi_revenue_sub')}      accent="var(--green)"  delay={0.15} />
        <StatCard label={t('p3.kpi_aov')}          value="$19.86"  sub={t('p3.kpi_aov_sub')}          accent="var(--purple)" delay={0.20} />
        <StatCard label={t('p3.kpi_return')}       value="2.2%"    sub={t('p3.kpi_return_sub')}       accent="var(--accent2)" delay={0.25} />
        <StatCard label={t('p3.kpi_top_country')}  value="UK"      sub={t('p3.kpi_top_country_sub')}  accent="var(--green)"  delay={0.30} />
      </section>

      {/* Section 1: Revenue Overview */}
      <section className={styles.section}>
        <SectionTitle index="01" title={t('p3.s1_title')} sub={t('p3.s1_sub')} />
        <div className={styles.grid2}>
          <ChartCard title={t('p3.chart_revenue')} sub={t('p3.chart_revenue_sub')} delay={0.05}>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={monthlyRevenue} margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2530" />
                <XAxis dataKey="month" tick={{ fill: '#636e7b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={fmtUSD} tick={{ fill: '#636e7b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<Tip prefix="$" />} />
                <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#00cc96" strokeWidth={2} dot={{ r: 3, fill: '#00cc96' }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title={t('p3.chart_countries')} sub={t('p3.chart_countries_sub')} delay={0.1}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={topCountries} layout="vertical" margin={{ left: 0, right: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2530" horizontal={false} />
                <XAxis type="number" tickFormatter={fmtUSD} tick={{ fill: '#636e7b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="country" width={100} tick={{ fill: '#cdd9e5', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<Tip prefix="$" />} />
                <Bar dataKey="revenue" name="Revenue" fill="#00cc96" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
        <div className={styles.insight}>
          <span className={styles.insightLabel}>{t('p3.insight_label')}</span>
          <p className={styles.insightText}>{t('p3.s1_insight')}</p>
        </div>
      </section>

      {/* Section 2: RFM Segmentation */}
      <section className={styles.section}>
        <SectionTitle index="02" title={t('p3.s2_title')} sub={t('p3.s2_sub')} />
        <div className={styles.grid2}>
          <ChartCard title={t('p3.chart_rfm_scatter')} sub={t('p3.chart_rfm_scatter_sub')} delay={0.05}>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart margin={{ left: 0, right: 20, top: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2530" />
                <XAxis type="number" dataKey="recency" name="Recency" unit=" days" tick={{ fill: '#636e7b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis type="number" dataKey="frequency" name="Frequency" unit=" orders" tick={{ fill: '#636e7b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <ZAxis type="number" dataKey="monetary" range={[40, 400]} />
                <Tooltip content={<ScatterTip />} />
                {Object.keys(SEGMENT_COLORS).map(seg => (
                  <Scatter
                    key={seg}
                    name={seg}
                    data={rfmScatter.filter(d => d.segment === seg)}
                    fill={SEGMENT_COLORS[seg]}
                  />
                ))}
                <Legend wrapperStyle={{ fontSize: 10, color: '#636e7b' }} />
              </ScatterChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title={t('p3.chart_segments')} sub={t('p3.chart_segments_sub')} delay={0.1}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={rfmSegments} layout="vertical" margin={{ left: 0, right: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2530" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#636e7b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="segment" width={110} tick={{ fill: '#cdd9e5', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<Tip />} />
                <Bar dataKey="count" name="Customers" radius={[0, 3, 3, 0]}>
                  {rfmSegments.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
        <div className={styles.insight}>
          <span className={styles.insightLabel}>{t('p3.insight_label')}</span>
          <p className={styles.insightText}>{t('p3.s2_insight')}</p>
        </div>
      </section>

      {/* Section 3: Cohort Analysis */}
      <section className={styles.section}>
        <SectionTitle index="03" title={t('p3.s3_title')} sub={t('p3.s3_sub')} />
        <CohortHeatmap data={cohortData} t={t} />
        <div className={styles.insight}>
          <span className={styles.insightLabel}>{t('p3.insight_label')}</span>
          <p className={styles.insightText}>{t('p3.s3_insight')}</p>
        </div>
      </section>

      {/* Section 4: Recommendations */}
      <section className={styles.section}>
        <SectionTitle index="04" title={t('p3.s4_title')} sub={t('p3.s4_sub')} />
        <div className={styles.recsBox}>
          <h3 className={styles.recsTitle}>{t('p3.recs_title')}</h3>
          <ul className={styles.recsList}>
            {t('p3.recs_items', { returnObjects: true }).map((item, i) => (
              <li key={i} className={styles.recsItem}>
                <span className={styles.recsNum}>0{i + 1}</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}
