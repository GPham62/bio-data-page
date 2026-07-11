import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Cell,
  ScatterChart, Scatter, LabelList, ReferenceLine,
} from 'recharts'
import StatCard            from '../components/StatCard.jsx'
import SectionTitle        from '../components/SectionTitle.jsx'
import ChartCard           from '../components/ChartCard.jsx'
import ChartTooltip        from '../components/ChartTooltip.jsx'
import InsightBlock        from '../components/InsightBlock.jsx'
import SqlCard             from '../components/SqlCard.jsx'
import Note                from '../components/Note.jsx'
import RoleSelectStrip from '../components/RoleSelectStrip.jsx'
import OverlapHeatmap  from '../components/OverlapHeatmap.jsx'
import { fmt, fmtUSD } from '../utils/formatters.js'
import { gridProps, axisMuted, axisStrong, barCursor, lineCursor, ROLE_TEXT } from '../utils/chartTheme.js'
import {
  mlResults, pythonUrl, sqlUrl,
} from '../data/project1.js'
import {
  ROLE_COLORS, roleSalary, roleTrend, roleBarriers, overlapMatrix,
  skillPremiumsDA, vietnamPostings,
  heroCards, verdictRows,
} from '../data/project1_roles.js'
import styles from './Project1.module.css'

// Recharts renders the first datum at the bottom of a vertical bar chart, so
// reverse the most-important-first list to put the strongest driver on top.
const importanceData = [...mlResults.featureImportance].reverse()

// Floating P25–P75 salary band with a solid median tick (levels.fyi-style).
// Rendered as the visible half of a stacked bar: an invisible base bar spans
// 0→p25, this shape draws the p25→p75 segment. Median position is linear
// interpolation, which only holds on a linear x-axis.
function IQRBand({ x, y, width, height, payload }) {
  const { p25, median, p75, short } = payload
  const c = ROLE_COLORS[short]
  const span = p75 - p25
  const tickX = span > 0 ? x + (width * (median - p25)) / span : x
  return (
    <g>
      <rect x={x} y={y} width={Math.max(width, 2)} height={height} rx={3}
            fill={c} fillOpacity={0.22} stroke={c} strokeOpacity={0.55} />
      <rect x={tickX - 1.5} y={y - 3} width={3} height={height + 6} rx={1.5} fill={c} />
    </g>
  )
}

// Degree-penalty dumbbell: hollow dot = median pay when a degree is required,
// filled dot = median when no degree is mentioned, connector = the gap.
// Same stacked-bar trick as IQRBand: invisible base 0→min(medians), this shape
// draws the min→max segment. Equal medians (DE) render as a concentric target.
function DegreeDumbbell({ x, y, width, height, payload }) {
  const { medDegreeMid: deg, medNoDegreeMid: nodeg, degreePenaltyMid: pen } = payload
  const cy = y + height / 2
  const xLo = x, xHi = x + width
  const xDeg = deg >= nodeg ? xHi : xLo
  const xNo = deg >= nodeg ? xLo : xHi
  const label = pen === 0 ? '±$0' : `−$${(Math.abs(pen) / 1000).toFixed(1).replace(/\.0$/, '')}K`
  return (
    <g>
      <line x1={xLo} x2={xHi} y1={cy} y2={cy} strokeWidth={2} style={{ stroke: 'var(--muted)' }} />
      {width < 2 ? (
        <>
          <circle cx={xDeg} cy={cy} r={7} fill="none" strokeWidth={2} style={{ stroke: 'var(--muted)' }} />
          <circle cx={xNo} cy={cy} r={4} style={{ fill: 'var(--accent)' }} />
        </>
      ) : (
        <>
          <circle cx={xDeg} cy={cy} r={5.5} strokeWidth={2} style={{ fill: 'var(--bg2)', stroke: 'var(--muted)' }} />
          <circle cx={xNo} cy={cy} r={5.5} style={{ fill: 'var(--accent)' }} />
        </>
      )}
      <text x={xHi + 12} y={cy} dominantBaseline="central"
            style={{ fontSize: '0.6875rem', fontWeight: 700, fill: pen <= -10000 ? '#ef553b' : 'var(--muted)' }}>
        {label}
      </text>
    </g>
  )
}

const SQL_SNIPPET = `-- Skill ROI: premium = median salary WITH the skill − median WITHOUT it,
-- computed on mid-level DA postings only so seniority can't fake the gap
WITH mid_da AS (
    SELECT job_id, salary_year_avg
    FROM job_postings_fact
    WHERE job_title_short = 'Data Analyst'
      AND salary_year_avg BETWEEN 10000 AND 600000
      AND NOT regexp_matches(LOWER(job_title), 'senior|sr[. ]|staff|principal|lead')
      AND NOT regexp_matches(LOWER(job_title), 'junior|jr[. ]|entry|intern|graduate')
),
job_skills AS (
    SELECT DISTINCT m.job_id, m.salary_year_avg, sd.skills AS skill
    FROM mid_da m
    JOIN skills_job_dim sjd ON sjd.job_id  = m.job_id
    JOIN skills_dim     sd  ON sd.skill_id = sjd.skill_id
)
SELECT
    skill,
    ROUND(MEDIAN(salary_year_avg) FILTER (has_skill)
        - MEDIAN(salary_year_avg) FILTER (NOT has_skill), 0) AS premium_usd,
    ROUND(100.0 * COUNT(*) FILTER (has_skill) / COUNT(*), 1) AS demand_pct
FROM flags   -- top-12 skills × every job, has_skill flag (full query on GitHub)
GROUP BY skill
ORDER BY premium_usd DESC;`

const DAX_SNIPPET = `Skill Premium ($) =
-- Same role, same level, same salary window — only the skill differs
VAR SkillJobs = CALCULATETABLE(DISTINCT(skills_job_dim[job_id]))
VAR BaseAll =
    FILTER(ALL(job_postings_fact),
        job_postings_fact[job_title_short] = "Data Analyst"
        && job_postings_fact[Seniority Level] = "mid"
        && job_postings_fact[salary_year_avg] >= 10000
        && job_postings_fact[salary_year_avg] <= 600000)
VAR WithSkill =
    MEDIANX(FILTER(BaseAll, job_postings_fact[job_id] IN SkillJobs),
        job_postings_fact[salary_year_avg])
VAR WithoutSkill =
    MEDIANX(FILTER(BaseAll, NOT(job_postings_fact[job_id] IN SkillJobs)),
        job_postings_fact[salary_year_avg])
RETURN WithSkill - WithoutSkill`

// .pbix is 114MB — over GitHub's 100MB repo limit, so it ships as a Release asset
export const PBIX_DOWNLOAD_URL =
  'https://github.com/GPham62/bio-data-page/releases/download/p1-dashboard-v1/p1_dashboard.pbix'

export default function Project1({ setActive }) {
  const { t } = useTranslation()

  return (
    <div className="projectPage" style={{ position: 'relative' }}>
      <button className="prev-btn" onClick={() => setActive('home')}>
        {t('nav.home')}
      </button>
      <button className="next-btn" onClick={() => setActive('p2')}>
        {t('nav.p2')}
      </button>

      {/* Hero */}
      <section className="projectHero fade-up">
        <div className="projectHeroMeta">
          <span className={styles.tag}>{t('p1.tag')}</span>
          <span className={styles.tag} style={{ borderColor: 'rgba(0,204,150,0.3)', color: 'var(--green)' }}>
            {t('p1.tag2')}
          </span>
        </div>
        <h1 className="projectHeroTitle">
          {t('p1.title1')}<br />
          <span className={styles.heroAccent}>{t('p1.title2')}</span>
        </h1>
        <p className="projectHeroSub">{t('p1.sub')}</p>
        <div className="projectHeroStack">
          {['SQL', 'Python', 'DuckDB', 'MotherDuck', 'Pandas', 'Plotly', 'Scikit-learn', 'Power BI', 'DAX'].map(tech => (
            <span key={tech} className="projectPill">{tech}</span>
          ))}
        </div>
        <RoleSelectStrip cards={heroCards} />
        <p className={styles.stripHint}>{t('p1.strip_hint')}</p>
        <div className={styles.linkRow}>
          <a className={styles.pythonLink} href={pythonUrl} target="_blank" rel="noopener noreferrer">
            {t('p1.python_link')} <span aria-hidden>↗</span>
          </a>
          <a className={styles.sqlLink} href={sqlUrl} target="_blank" rel="noopener noreferrer">
            {t('p1.sql_link')} <span aria-hidden>↗</span>
          </a>
        </div>
      </section>

      {/* KPIs */}
      <section className={styles.kpiRow}>
        <StatCard label={t('p1.kpi_postings')}   value="1.6M"   sub={t('p1.kpi_postings_sub')}   accent="var(--accent)"  delay={0.05} />
        <StatCard label={t('p1.kpi_countries')}  value="5"      sub={t('p1.kpi_countries_sub')}  accent="var(--green)"   delay={0.10} />
        <StatCard label={t('p1.kpi_salary_rec')} value="40K"    sub={t('p1.kpi_salary_rec_sub')} accent="var(--purple)"  delay={0.15} />
        <StatCard label={t('p1.kpi_median')}     value="7.6%"   sub={t('p1.kpi_median_sub')}     accent="var(--accent2)" delay={0.20} />
        <StatCard label={t('p1.kpi_r2')}         value="0.88"   sub={t('p1.kpi_r2_sub')}         accent="var(--green)"   delay={0.25} />
        <StatCard label={t('p1.kpi_skill')}      value="+$12K"  sub={t('p1.kpi_skill_sub')}      accent="var(--purple)"  delay={0.30} />
      </section>

      {/* Section 01: The Contenders */}
      <section className="projectSection">
        <SectionTitle index="01" title={t('p1.s1_title')} sub={t('p1.s1_sub')} fxIndex fxTitle />
        <div className="projectGrid1">
          <ChartCard title={t('p1.chart_salary')} sub={t('p1.chart_salary_sub')} delay={0.05}>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={roleSalary.map(r => ({ ...r, band: r.p75 - r.p25 }))}
                        layout="vertical" margin={{ left: 0, right: 30 }}>
                <CartesianGrid {...gridProps} horizontal={false} />
                <XAxis type="number" tickFormatter={fmtUSD} {...axisMuted} />
                <YAxis type="category" dataKey="role" width={130} {...axisStrong} />
                <Tooltip cursor={barCursor} content={({ active, payload, label }) => (
                  <ChartTooltip active={active} label={label} prefix="$" payload={!payload?.length ? [] : [
                    { name: t('p1.tt_median'), value: payload[0].payload.median, color: ROLE_COLORS[payload[0].payload.short] },
                    { name: 'P25', value: payload[0].payload.p25, color: '#8b949e' },
                    { name: 'P75', value: payload[0].payload.p75, color: '#8b949e' },
                  ]} />
                )} />
                <Bar dataKey="p25" stackId="iqr" fill="transparent" barSize={18} />
                <Bar dataKey="band" stackId="iqr" barSize={18} shape={<IQRBand />} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className={styles.multiples}>
          {roleSalary.map((r, i) => (
            <ChartCard key={r.short} title={r.role} sub={`${fmt(roleTrend.reduce((s, m) => s + (m[r.role] || 0), 0))} ${t('p1.unit_postings')}`} delay={0.05 + i * 0.04}>
              <ResponsiveContainer width="100%" height={110}>
                <LineChart data={roleTrend} margin={{ left: 0, right: 8, top: 4 }}>
                  <XAxis dataKey="month" hide />
                  <YAxis hide domain={[0, 'dataMax']} />
                  <Tooltip cursor={lineCursor} content={<ChartTooltip />} />
                  <Line type="monotone" dataKey={r.role} stroke={ROLE_COLORS[r.short]} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          ))}
        </div>
        <InsightBlock label={t('p1.insight_label')} text={t('p1.s1_insight')} accent="var(--accent)" />
      </section>

      {/* Section 02: Entry Barriers */}
      <section className="projectSection">
        <SectionTitle index="02" title={t('p1.s2_title')} sub={t('p1.s2_sub')} fxIndex fxTitle />
        <div className="projectGrid2">
          <ChartCard title={t('p1.chart_junior')} sub={t('p1.chart_junior_sub')} delay={0.05}>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={roleBarriers} layout="vertical" margin={{ left: 0, right: 24 }}>
                <CartesianGrid {...gridProps} horizontal={false} />
                <XAxis type="number" tickFormatter={v => `${v}%`} {...axisMuted} />
                <YAxis type="category" dataKey="role" width={130} {...axisStrong} />
                <Tooltip cursor={barCursor} content={<ChartTooltip suffix="%" />} />
                <Bar dataKey="juniorPct" radius={[0, 3, 3, 0]} barSize={18}>
                  {roleBarriers.map(r => {
                    const short = roleSalary.find(x => x.role === r.role).short
                    return <Cell key={r.role} fill={ROLE_COLORS[short]} />
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title={t('p1.chart_degpen')} sub={t('p1.chart_degpen_sub')} delay={0.1}>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={roleBarriers.map(r => ({
                          ...r,
                          lo: Math.min(r.medDegreeMid, r.medNoDegreeMid),
                          gap: Math.abs(r.degreePenaltyMid),
                        }))}
                        layout="vertical" margin={{ left: 0, right: 64 }}>
                <CartesianGrid {...gridProps} horizontal={false} />
                <XAxis type="number" tickFormatter={fmtUSD} {...axisMuted} />
                <YAxis type="category" dataKey="role" width={130} {...axisStrong} />
                <Tooltip cursor={barCursor} content={({ active, payload, label }) => (
                  <ChartTooltip active={active} label={label} payload={!payload?.length ? [] : [
                    { name: t('p1.tt_nodeg'), value: `$${payload[0].payload.medNoDegreeMid.toLocaleString()}`, color: '#e6edf3' },
                    { name: t('p1.tt_deg'), value: `$${payload[0].payload.medDegreeMid.toLocaleString()}`, color: '#8b949e' },
                    { name: t('p1.tt_gap'), value: `${payload[0].payload.degreePenaltyMid === 0 ? '±' : '−'}$${Math.abs(payload[0].payload.degreePenaltyMid).toLocaleString()}`,
                      color: payload[0].payload.degreePenaltyMid <= -10000 ? '#ef553b' : '#8b949e' },
                  ]} />
                )} />
                <Bar dataKey="lo" stackId="dp" fill="transparent" barSize={18} />
                <Bar dataKey="gap" stackId="dp" barSize={18} shape={<DegreeDumbbell />} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
        <Note text={t('p1.confounder_note')} accent="var(--accent2)" />
        <InsightBlock label={t('p1.insight_label')} text={t('p1.s2_insight')} accent="var(--accent)" />
      </section>

      {/* Section 03: Transition Map */}
      <section className="projectSection">
        <SectionTitle index="03" title={t('p1.s3_title')} sub={t('p1.s3_sub')} fxIndex fxTitle />
        <ChartCard title={t('p1.chart_overlap')} sub={t('p1.chart_overlap_sub')} delay={0.05}>
          <OverlapHeatmap matrix={overlapMatrix} />
        </ChartCard>
        <InsightBlock label={t('p1.insight_label')} text={t('p1.s3_insight')} accent="var(--accent)" />
      </section>

      {/* Section 04: Skill ROI */}
      <section className="projectSection">
        <SectionTitle index="04" title={t('p1.s4_title')} sub={t('p1.s4_sub')} fxIndex fxTitle />
        <ChartCard title={t('p1.chart_roi')} sub={t('p1.chart_roi_sub')} delay={0.05}>
          <ResponsiveContainer width="100%" height={340}>
            <ScatterChart margin={{ left: 8, right: 30, top: 16, bottom: 8 }}>
              <CartesianGrid {...gridProps} />
              <XAxis type="number" dataKey="demandPct" name="Demand" tickFormatter={v => `${v}%`} {...axisMuted} />
              <YAxis type="number" dataKey="premium" name="Premium" tickFormatter={fmtUSD} {...axisMuted} />
              <ReferenceLine y={0} stroke="#636e7b" strokeDasharray="4 3" />
              <Tooltip content={<ChartTooltip prefix="$" />} cursor={lineCursor} />
              <Scatter data={skillPremiumsDA} fill="#00e5ff">
                {skillPremiumsDA.map(d => (
                  <Cell key={d.skill} fill={d.premium >= 0 ? '#00cc96' : '#ef553b'} />
                ))}
                {/* ponytail: aws/azure collide at top-left — hand-nudge aws below its dot; revisit if the skill list changes */}
                <LabelList dataKey="skill" position="top" content={({ x, y, value }) => (
                  <text x={x} y={value === 'aws' ? y + 26 : y - 4} textAnchor="middle"
                        style={{ fontSize: '0.6875rem', fill: 'var(--muted)' }}>{value}</text>
                )} />
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </ChartCard>
        <SqlCard
          accent="var(--accent)"
          tabs={[
            { label: 'SQL', title: t('p1.sql_card_title'), code: SQL_SNIPPET, href: sqlUrl, linkLabel: t('p1.sql_link') },
            { label: 'DAX', title: t('p1.dax_card_title'), code: DAX_SNIPPET, href: PBIX_DOWNLOAD_URL, linkLabel: t('p1.dash_download') },
          ]}
        />
        <InsightBlock label={t('p1.insight_label')} text={t('p1.s4_insight')} accent="var(--accent)" />
      </section>

      {/* Section 05: ML reframe */}
      <section className="projectSection">
        <SectionTitle index="05" title={t('p1.s5_title')} sub={t('p1.s5_sub')} fxIndex fxTitle />

        <div className={styles.mlMeta}>
          <div className={styles.mlScore} style={{ '--ml-accent': 'var(--accent)' }}>
            <span className={styles.mlScoreLabel}>{t('p1.ml_r2_label')}</span>
            <span className={styles.mlScoreVal}>{mlResults.r2}</span>
            <span className={styles.mlScoreSub}>{t('p1.ml_r2_sub')}</span>
          </div>
          <div className={styles.mlScore} style={{ '--ml-accent': 'var(--accent2)' }}>
            <span className={styles.mlScoreLabel}>{t('p1.ml_mae_label')}</span>
            <span className={styles.mlScoreVal}>{fmtUSD(mlResults.mae)}</span>
            <span className={styles.mlScoreSub}>{t('p1.ml_mae_sub')}</span>
          </div>
          <div className={styles.mlScore} style={{ '--ml-accent': 'var(--purple)' }}>
            <span className={styles.mlScoreLabel}>{t('p1.ml_trainr2_label')}</span>
            <span className={styles.mlScoreVal}>{mlResults.trainR2}</span>
            <span className={styles.mlScoreSub}>{t('p1.ml_trainr2_sub')}</span>
          </div>
          <div className={styles.mlScore} style={{ '--ml-accent': 'var(--green)' }}>
            <span className={styles.mlScoreLabel}>{t('p1.ml_base_label')}</span>
            <span className={styles.mlScoreVal}>{fmtUSD(mlResults.baselineMae)}</span>
            <span className={styles.mlScoreSub}>{t('p1.ml_base_sub')}</span>
          </div>
        </div>

        <ChartCard title={t('p1.chart_features')} sub={t('p1.chart_features_sub')} delay={0.1}>
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={importanceData} layout="vertical" margin={{ left: 0, right: 30 }} barSize={18}>
              <CartesianGrid {...gridProps} horizontal={false} />
              <XAxis type="number" tickFormatter={v => `${v}%`} {...axisMuted} />
              <YAxis type="category" dataKey="feature" width={130} {...axisStrong} />
              <Tooltip cursor={barCursor} content={<ChartTooltip suffix="%" />} />
              <Bar dataKey="importance" radius={[0, 3, 3, 0]}>
                {importanceData.map((d, i) => <Cell key={i} fill={d.direction > 0 ? '#00cc96' : '#ef553b'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <Note text={t('p1.ml_note')} accent="var(--accent)" />
        <InsightBlock label={t('p1.insight_label')} text={t('p1.s5_insight')} accent="var(--accent)" />
      </section>

      {/* Section 06: Vietnam reality check */}
      <section className="projectSection">
        <SectionTitle index="06" title={t('p1.s6_title')} sub={t('p1.s6_sub')} fxIndex fxTitle />
        <div className={styles.vnCard}>
          <div className={styles.vnTitle}>{t('p1.vn_title')}</div>
          <div className={styles.vnRow}>
            {vietnamPostings.map(v => {
              const short = roleSalary.find(x => x.role === v.role).short
              return (
                <div key={v.role} className={styles.vnStat} style={{ '--vn-accent': ROLE_TEXT[short] }}>
                  <span className={styles.vnShort}>{short}</span>
                  <span className={styles.vnCount}>{v.postings.toLocaleString()}</span>
                  <span className={styles.vnN}>n = {v.postings.toLocaleString()}</span>
                </div>
              )
            })}
          </div>
          <Note text={t('p1.vn_caveat')} accent="var(--accent2)" />
        </div>
      </section>

      {/* Section 07: Verdict */}
      <section className="projectSection">
        <SectionTitle index="07" title={t('p1.s7_title')} sub={t('p1.s7_sub')} fxIndex fxTitle />
        <div className={styles.verdictWrap}>
          <table className={styles.verdictTable}>
            <thead>
              <tr>
                <th />
                {['DA', 'BA', 'DE', 'DS', 'SE'].map(s => (
                  <th key={s} style={{ color: ROLE_TEXT[s] }}>{s}</th>
                ))}
                <th>{t('p1.verdict_winner')}</th>
              </tr>
            </thead>
            <tbody>
              {verdictRows.map(row => (
                <tr key={row.axisKey}>
                  <td className={styles.verdictAxis}>{t(`p1.verdict_axis_${row.axisKey}`)}</td>
                  {['DA', 'BA', 'DE', 'DS', 'SE'].map(s => (
                    <td key={s} className={row.winnerShort === s ? styles.verdictWin : undefined}>
                      {row.cells[s]}
                    </td>
                  ))}
                  <td className={styles.verdictWinner} style={{ color: ROLE_TEXT[row.winnerShort] }}>
                    {row.winnerShort}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <InsightBlock label={t('p1.insight_label')} text={t('p1.s7_insight')} accent="var(--green)" />
      </section>

      {/* Section 08: Power BI dashboard */}
      <section className="projectSection">
        <SectionTitle index="08" title={t('p1.s8_title')} sub={t('p1.s8_sub')} fxIndex fxTitle />
        <div className="projectGrid1">
          <ChartCard title={t('p1.dash_p1_caption')} delay={0.05}>
            <a href="/p1_dashboard_faceoff.png" target="_blank" rel="noopener">
              <img src="/p1_dashboard_faceoff.png" alt={t('p1.dash_p1_caption')} className={styles.dashImg} />
            </a>
          </ChartCard>
          <ChartCard title={t('p1.dash_p2_caption')} delay={0.1}>
            <a href="/p1_dashboard_switching.png" target="_blank" rel="noopener">
              <img src="/p1_dashboard_switching.png" alt={t('p1.dash_p2_caption')} className={styles.dashImg} />
            </a>
          </ChartCard>
        </div>
        <div className={styles.dashDownloadRow}>
          <a className={styles.dashDownload} href={PBIX_DOWNLOAD_URL} target="_blank" rel="noopener noreferrer">
            {t('p1.dash_download')} ↓
          </a>
        </div>
      </section>

    </div>
  )
}
