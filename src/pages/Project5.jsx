import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  ComposedChart, Line, ScatterChart, Scatter, ZAxis,
} from 'recharts'
import StatCard     from '../components/StatCard.jsx'
import SectionTitle from '../components/SectionTitle.jsx'
import ChartCard    from '../components/ChartCard.jsx'
import ChartTooltip from '../components/ChartTooltip.jsx'
import InsightBlock from '../components/InsightBlock.jsx'
import Note         from '../components/Note.jsx'
import { gridProps, axisMuted, axisStrong } from '../utils/chartTheme.js'
import { pickMaxGapPair, pickTopByShare, pickTopByDrag } from '../utils/project5Synthesis.js'
import {
  stats, ratingHistogram, byCategory, ratingPairs, complaints,
  collectorUrl, notebookUrl,
} from '../data/project5.js'
import styles from './Project5.module.css'

// Literal SVG colors, not CSS vars — Recharts writes `fill` as a presentation
// attribute, and marks need to stay visible in both themes rather than
// silently reading `var(--accent)` (see chartTheme.js's note on this).
const RATING_ACCENT = '#00e5ff'
const RATING_MUTED  = '#3a4048'
const PRICE_BAR     = '#00cc96'
const RATING_LINE   = '#ff6b35'
const SCATTER_DOT   = '#a371f7'
const DRAG_LOW      = [0x63, 0x6e, 0x7b] // muted grey — barely drags the rating
const DRAG_HIGH     = [0xff, 0x6b, 0x35] // accent2 — drags the rating hard
const DRAG_NONE     = '#3a4048'          // too few reviews to score

const dragValues = complaints.map(c => c.drag).filter(d => d != null)
const DRAG_MIN = Math.min(...dragValues)
const DRAG_MAX = Math.max(...dragValues)
const MAX_GAP_PAIR = pickMaxGapPair(ratingPairs)

function dragColor(drag) {
  if (drag == null) return DRAG_NONE
  const t = DRAG_MAX > DRAG_MIN ? (drag - DRAG_MIN) / (DRAG_MAX - DRAG_MIN) : 0.5
  const lerp = (a, b) => Math.round(a + (b - a) * t)
  const [r, g, b] = DRAG_LOW.map((c, i) => lerp(c, DRAG_HIGH[i]))
  return `rgb(${r}, ${g}, ${b})`
}

export default function Project5({ setActive }) {
  const { t } = useTranslation()

  const complaintRows = complaints.map(c => ({
    ...c,
    label: t(`p5.complaint_${c.category}`),
  }))

  const topByShare = pickTopByShare(complaints)
  const topByDrag = pickTopByDrag(complaints)

  return (
    <div className="projectPage" style={{ position: 'relative' }}>
      <button className="prev-btn" onClick={() => setActive('p4')}>
        {t('nav.p4')}
      </button>
      <button className="next-btn" onClick={() => setActive('home')}>
        {t('nav.home')}
      </button>

      {/* Hero */}
      <section className="projectHero fade-up">
        <div className="projectHeroMeta">
          <span className={styles.tag}>{t('p5.tag')}</span>
          <span className={styles.tag} style={{ borderColor: 'rgba(163,113,247,0.3)', color: 'var(--purple)' }}>
            {t('p5.tag2')}
          </span>
        </div>
        <h1 className="projectHeroTitle">
          {t('p5.title1')}<br />
          <span className={styles.heroAccent}>{t('p5.title2')}</span>
        </h1>
        <p className="projectHeroSub">{t('p5.sub', { n: stats.restaurants })}</p>
        <div className="projectHeroStack">
          {['Python', 'pandas', 'BeautifulSoup', 'Claude API'].map(tech => (
            <span key={tech} className="projectPill">{tech}</span>
          ))}
        </div>
        <div className={styles.linkRow}>
          <a className={styles.collectorLink} href={collectorUrl} target="_blank" rel="noopener noreferrer">
            {t('p5.collector_link')} <span aria-hidden>↗</span>
          </a>
          <a className={styles.notebookLink} href={notebookUrl} target="_blank" rel="noopener noreferrer">
            {t('p5.notebook_link')} <span aria-hidden>↗</span>
          </a>
        </div>
      </section>

      {/* KPIs — four, and only four */}
      <section className={styles.kpiRow}>
        <StatCard
          label={t('p5.kpi_restaurants')}
          value={String(stats.restaurants)}
          sub={t('p5.kpi_restaurants_sub')}
          accent="var(--green)"
          delay={0.05}
        />
        <StatCard
          label={t('p5.kpi_reviews')}
          value={String(stats.reviews)}
          sub={t('p5.kpi_reviews_sub', { reviewed: stats.reviewedRestaurants, total: stats.restaurants })}
          accent="var(--purple)"
          delay={0.10}
        />
        <StatCard
          label={t('p5.kpi_share45')}
          value={`${(stats.shareAbove45 * 100).toFixed(1)}%`}
          sub={t('p5.kpi_share45_sub', { n: stats.analysable })}
          accent="var(--accent2)"
          delay={0.15}
        />
        <StatCard
          label={t('p5.kpi_correlation')}
          value={stats.correlation.toFixed(2)}
          sub={t('p5.kpi_correlation_sub')}
          accent="var(--accent)"
          delay={0.20}
        />
      </section>

      {/* Section 01: the rating wall */}
      <section className="projectSection">
        <SectionTitle index="01" title={t('p5.s1_title')} sub={t('p5.s1_sub')} fxIndex fxTitle />
        <ChartCard title={t('p5.chart_rating_wall')} sub={t('p5.chart_rating_wall_sub')} delay={0.05}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ratingHistogram} margin={{ left: 0, right: 20 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="rating" {...axisMuted} />
              <YAxis allowDecimals={false} {...axisMuted} />
              <Tooltip content={<ChartTooltip color={RATING_ACCENT} />} />
              <Bar dataKey="count" name={t('p5.unit_restaurants')} radius={[3, 3, 0, 0]}>
                {ratingHistogram.map(row => (
                  <Cell key={row.rating} fill={row.rating >= 4.5 ? RATING_ACCENT : RATING_MUTED} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <InsightBlock label={t('p5.insight_label')} text={t('p5.s1_insight')} accent="var(--accent)" />
      </section>

      {/* Section 02: price does not move it */}
      <section className="projectSection">
        <SectionTitle index="02" title={t('p5.s2_title')} sub={t('p5.s2_sub')} fxIndex fxTitle />
        <ChartCard title={t('p5.chart_price_rating')} sub={t('p5.chart_price_rating_sub')} delay={0.05}>
          <ResponsiveContainer width="100%" height={320}>
            <ComposedChart data={byCategory} margin={{ left: 0, right: 20, bottom: 10 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="category" {...axisMuted} interval={0} angle={-15} textAnchor="end" height={60} />
              <YAxis yAxisId="left" {...axisMuted} />
              <YAxis yAxisId="right" orientation="right" domain={[4, 5]} {...axisMuted} />
              <Tooltip content={<ChartTooltip color={PRICE_BAR} />} />
              <Bar yAxisId="left" dataKey="medianPrice" name={t('p5.tt_median_price')} fill={PRICE_BAR} radius={[3, 3, 0, 0]} />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="medianRating"
                name={t('p5.tt_median_rating')}
                stroke={RATING_LINE}
                strokeWidth={2}
                dot={{ r: 4, fill: RATING_LINE }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>
        <InsightBlock label={t('p5.insight_label')} text={t('p5.s2_insight', { spread: stats.priceSpread, ratingSpread: stats.ratingSpread })} accent="var(--green)" />
      </section>

      {/* Section 03: the two ratings disagree */}
      <section className="projectSection">
        <SectionTitle index="03" title={t('p5.s3_title')} sub={t('p5.s3_sub')} fxIndex fxTitle />
        <ChartCard
          title={t('p5.chart_two_ratings')}
          sub={t('p5.chart_two_ratings_sub', { n: stats.pairedRestaurants, r: stats.correlation.toFixed(2) })}
          delay={0.05}
        >
          <ResponsiveContainer width="100%" height={320}>
            <ScatterChart margin={{ left: 0, right: 20, top: 10, bottom: 10 }}>
              <CartesianGrid {...gridProps} />
              <XAxis type="number" dataKey="sf" name={t('p5.axis_sf')} domain={[4, 5]} {...axisMuted} />
              <YAxis type="number" dataKey="foody" name={t('p5.axis_foody')} domain={[0, 10]} {...axisMuted} />
              <ZAxis type="number" dataKey="n" range={[30, 200]} />
              <Tooltip content={<ChartTooltip color={SCATTER_DOT} />} cursor={{ strokeDasharray: '3 3' }} />
              <Scatter data={ratingPairs} fill={SCATTER_DOT} fillOpacity={0.65} />
            </ScatterChart>
          </ResponsiveContainer>
        </ChartCard>
        <InsightBlock
          label={t('p5.insight_label')}
          text={t('p5.s3_insight', { sf: MAX_GAP_PAIR.sf, foody: MAX_GAP_PAIR.foody })}
          accent="var(--purple)"
        />
      </section>

      {/* Section 04: what people actually complained about (reviews are 2018-2021) */}
      <section className="projectSection">
        <SectionTitle index="04" title={t('p5.s4_title')} sub={t('p5.s4_sub')} fxIndex fxTitle />
        <ChartCard title={t('p5.chart_complaints')} sub={t('p5.chart_complaints_sub')} delay={0.05}>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={complaintRows} layout="vertical" margin={{ left: 0, right: 24 }}>
              <CartesianGrid {...gridProps} horizontal={false} />
              <XAxis type="number" allowDecimals={false} {...axisMuted} />
              <YAxis type="category" dataKey="label" width={110} {...axisStrong} />
              <Tooltip content={<ChartTooltip color={`rgb(${DRAG_HIGH.join(', ')})`} />} />
              <Bar dataKey="n" name={t('p5.unit_reviews')} radius={[0, 3, 3, 0]}>
                {complaintRows.map(row => (
                  <Cell key={row.category} fill={dragColor(row.drag)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <div className={styles.dragLegend}>
          <span className={styles.dragLegendItem}>
            <span className={styles.dragSwatch} style={{ background: 'rgb(99, 110, 123)' }} />
            {t('p5.legend_low_drag')}
          </span>
          <span className={styles.dragLegendItem}>
            <span className={styles.dragSwatch} style={{ background: 'rgb(255, 107, 53)' }} />
            {t('p5.legend_high_drag')}
          </span>
          <span className={styles.dragLegendItem}>
            <span className={styles.dragSwatch} style={{ background: DRAG_NONE }} />
            {t('p5.legend_no_drag')}
          </span>
        </div>
        <InsightBlock
          label={t('p5.insight_label')}
          text={t('p5.s4_insight', {
            topShareLabel: t(`p5.complaint_${topByShare.category}`),
            topShareN: topByShare.n,
            topSharePct: (topByShare.share * 100).toFixed(0),
            topDragLabel: topByDrag ? t(`p5.complaint_${topByDrag.category}`) : t('p5.legend_no_drag'),
          })}
          accent="var(--accent2)"
        />
      </section>

      {/* Section 05: method and limits */}
      <section className="projectSection">
        <SectionTitle index="05" title={t('p5.s5_title')} sub={t('p5.s5_sub')} fxIndex fxTitle />

        <div className={styles.methodGrid}>
          <div className={styles.methodItem}>
            <span className={styles.methodLabel}>{t('p5.method_collect_title')}</span>
            <p className={styles.methodText}>{t('p5.method_collect_text')}</p>
          </div>
          <div className={styles.methodItem}>
            <span className={styles.methodLabel}>{t('p5.method_boundary_title')}</span>
            <p className={styles.methodText}>{t('p5.method_boundary_text')}</p>
          </div>
          <div className={styles.methodItem}>
            <span className={styles.methodLabel}>{t('p5.method_ethics_title')}</span>
            <p className={styles.methodText}>{t('p5.method_ethics_text')}</p>
          </div>
          <div className={styles.methodItem}>
            <span className={styles.methodLabel}>{t('p5.method_accuracy_title')}</span>
            <p className={styles.methodText}>
              {t('p5.method_accuracy_text', { pct: (stats.labelAccuracy * 100).toFixed(1) })}
            </p>
          </div>
        </div>

        <div className={styles.linkRow}>
          <a className={styles.collectorLink} href={collectorUrl} target="_blank" rel="noopener noreferrer">
            {t('p5.method_collector_link')} <span aria-hidden>↗</span>
          </a>
          <a className={styles.notebookLink} href={notebookUrl} target="_blank" rel="noopener noreferrer">
            {t('p5.method_notebook_link')} <span aria-hidden>↗</span>
          </a>
        </div>

        <div className={styles.caveatsBox}>
          <span className={styles.caveatsLabel}>{t('p5.caveats_title')}</span>
          <ul className={styles.caveatsList}>
            {t('p5.caveats_items', { returnObjects: true, reviewed: stats.reviewedRestaurants, total: stats.restaurants }).map((item, i) => (
              <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
            ))}
          </ul>
        </div>

        <Note text={t('p5.method_note')} accent="var(--accent)" />
      </section>
    </div>
  )
}
