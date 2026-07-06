import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Cell, ErrorBar,
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
import { gridProps, axisMuted, axisStrong } from '../utils/chartTheme.js'
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

const SQL_SNIPPET = `-- Populate skills demand fact: boolean flags → integers, then aggregate by month
WITH job_postings_prep AS (
    SELECT
        sjd.skill_id,
        DATE_TRUNC('month', jpf.job_posted_date) AS month_start_date,
        jpf.job_title_short,
        CASE WHEN jpf.job_work_from_home    THEN 1 ELSE 0 END AS is_remote,
        CASE WHEN jpf.job_health_insurance  THEN 1 ELSE 0 END AS has_health_insurance,
        CASE WHEN jpf.job_no_degree_mention THEN 1 ELSE 0 END AS no_degree_mentioned
    FROM job_postings_fact AS jpf
    INNER JOIN skills_job_dim AS sjd ON sjd.job_id = jpf.job_id
)
SELECT
    skill_id, month_start_date, job_title_short,
    COUNT(*)                  AS postings_count,
    SUM(is_remote)            AS remote_postings_count,
    SUM(has_health_insurance) AS health_insurance_postings_count,
    SUM(no_degree_mentioned)  AS no_degree_postings_count
FROM  job_postings_prep
GROUP BY ALL
ORDER BY skill_id, month_start_date, job_title_short;`

const DAX_SNIPPET = `Degree Penalty ($) =
-- Same-level comparison: raw medians are confounded by seniority
VAR MedDegree =
    MEDIANX(
        FILTER(job_postings_fact,
            job_postings_fact[job_no_degree_mention] = FALSE()
            && job_postings_fact[salary_year_avg] >= 10000
            && job_postings_fact[salary_year_avg] <= 600000),
        job_postings_fact[salary_year_avg])
VAR MedNoDegree =
    MEDIANX(
        FILTER(job_postings_fact,
            job_postings_fact[job_no_degree_mention] = TRUE()
            && job_postings_fact[salary_year_avg] >= 10000
            && job_postings_fact[salary_year_avg] <= 600000),
        job_postings_fact[salary_year_avg])
RETURN MedNoDegree - MedDegree`

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
        <SectionTitle index="01" title={t('p1.s1_title')} sub={t('p1.s1_sub')} />
        <div className="projectGrid1">
          <ChartCard title={t('p1.chart_salary')} sub={t('p1.chart_salary_sub')} delay={0.05}>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={roleSalary.map(r => ({ ...r, err: [r.median - r.p25, r.p75 - r.median] }))}
                        layout="vertical" margin={{ left: 0, right: 30 }}>
                <CartesianGrid {...gridProps} horizontal={false} />
                <XAxis type="number" tickFormatter={fmtUSD} {...axisMuted} />
                <YAxis type="category" dataKey="role" width={130} {...axisStrong} />
                <Tooltip content={<ChartTooltip prefix="$" />} />
                <Bar dataKey="median" radius={[0, 3, 3, 0]} barSize={18}>
                  {roleSalary.map(r => <Cell key={r.short} fill={ROLE_COLORS[r.short]} />)}
                  <ErrorBar dataKey="err" direction="x" width={5} strokeWidth={1.5} stroke="#8b949e" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className={styles.multiples}>
          {roleSalary.map((r, i) => (
            <ChartCard key={r.short} title={r.role} sub={`${fmt(roleTrend.reduce((s, m) => s + (m[r.role] || 0), 0))} postings`} delay={0.05 + i * 0.04}>
              <ResponsiveContainer width="100%" height={110}>
                <LineChart data={roleTrend} margin={{ left: 0, right: 8, top: 4 }}>
                  <XAxis dataKey="month" hide />
                  <YAxis hide domain={[0, 'dataMax']} />
                  <Tooltip content={<ChartTooltip />} />
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
        <SectionTitle index="02" title={t('p1.s2_title')} sub={t('p1.s2_sub')} />
        <div className="projectGrid2">
          <ChartCard title={t('p1.chart_junior')} sub={t('p1.chart_junior_sub')} delay={0.05}>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={roleBarriers} layout="vertical" margin={{ left: 0, right: 24 }}>
                <CartesianGrid {...gridProps} horizontal={false} />
                <XAxis type="number" tickFormatter={v => `${v}%`} {...axisMuted} />
                <YAxis type="category" dataKey="role" width={130} {...axisStrong} />
                <Tooltip content={<ChartTooltip suffix="%" />} />
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
              <BarChart data={roleBarriers} layout="vertical" margin={{ left: 0, right: 30 }}>
                <CartesianGrid {...gridProps} horizontal={false} />
                <XAxis type="number" tickFormatter={fmtUSD} {...axisMuted} />
                <YAxis type="category" dataKey="role" width={130} {...axisStrong} />
                <Tooltip content={<ChartTooltip prefix="$" />} />
                <Bar dataKey="degreePenaltyMid" radius={[0, 3, 3, 0]} barSize={18}>
                  {roleBarriers.map(r => (
                    <Cell key={r.role} fill={r.degreePenaltyMid < -5000 ? '#ef553b' : '#00cc96'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
        <Note text={t('p1.confounder_note')} accent="var(--accent2)" />
        <InsightBlock label={t('p1.insight_label')} text={t('p1.s2_insight')} accent="var(--accent)" />
      </section>

      {/* Section 03: Transition Map */}
      <section className="projectSection">
        <SectionTitle index="03" title={t('p1.s3_title')} sub={t('p1.s3_sub')} />
        <ChartCard title={t('p1.chart_overlap')} sub={t('p1.chart_overlap_sub')} delay={0.05}>
          <OverlapHeatmap matrix={overlapMatrix} />
        </ChartCard>
        <SqlCard title={t('p1.sql_card_title')} code={SQL_SNIPPET} href={sqlUrl} linkLabel={t('p1.sql_link')} accent="var(--accent)" />
        <InsightBlock label={t('p1.insight_label')} text={t('p1.s3_insight')} accent="var(--accent)" />
      </section>

      {/* Section 04: Skill ROI */}
      <section className="projectSection">
        <SectionTitle index="04" title={t('p1.s4_title')} sub={t('p1.s4_sub')} />
        <ChartCard title={t('p1.chart_roi')} sub={t('p1.chart_roi_sub')} delay={0.05}>
          <ResponsiveContainer width="100%" height={340}>
            <ScatterChart margin={{ left: 8, right: 30, top: 16, bottom: 8 }}>
              <CartesianGrid {...gridProps} />
              <XAxis type="number" dataKey="demandPct" name="Demand" tickFormatter={v => `${v}%`} {...axisMuted} />
              <YAxis type="number" dataKey="premium" name="Premium" tickFormatter={fmtUSD} {...axisMuted} />
              <ReferenceLine y={0} stroke="#636e7b" strokeDasharray="4 3" />
              <Tooltip content={<ChartTooltip prefix="$" />} cursor={{ strokeDasharray: '3 3' }} />
              <Scatter data={skillPremiumsDA} fill="#00e5ff">
                {skillPremiumsDA.map(d => (
                  <Cell key={d.skill} fill={d.premium >= 0 ? '#00cc96' : '#ef553b'} />
                ))}
                <LabelList dataKey="skill" position="top" style={{ fontSize: '0.6875rem', fill: '#8b949e' }} />
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </ChartCard>
        <InsightBlock label={t('p1.insight_label')} text={t('p1.s4_insight')} accent="var(--accent)" />
      </section>

      {/* Section 05: ML reframe */}
      <section className="projectSection">
        <SectionTitle index="05" title={t('p1.s5_title')} sub={t('p1.s5_sub')} />

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
              <Tooltip content={<ChartTooltip suffix="%" />} />
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
        <SectionTitle index="06" title={t('p1.s6_title')} sub={t('p1.s6_sub')} />
        <div className={styles.vnCard}>
          <div className={styles.vnTitle}>{t('p1.vn_title')}</div>
          <div className={styles.vnRow}>
            {vietnamPostings.map(v => {
              const short = roleSalary.find(x => x.role === v.role).short
              return (
                <div key={v.role} className={styles.vnStat} style={{ '--vn-accent': ROLE_COLORS[short] }}>
                  <span className={styles.vnShort}>{short}</span>
                  <span className={styles.vnCount}>{fmt(v.postings)}</span>
                  <span className={styles.vnN}>n = {fmt(v.postings)}</span>
                </div>
              )
            })}
          </div>
          <Note text={t('p1.vn_caveat')} accent="var(--accent2)" />
        </div>
      </section>

      {/* Section 07: Verdict */}
      <section className="projectSection">
        <SectionTitle index="07" title={t('p1.s7_title')} sub={t('p1.s7_sub')} />
        <div className={styles.verdictWrap}>
          <table className={styles.verdictTable}>
            <thead>
              <tr>
                <th />
                {['DA', 'BA', 'DE', 'DS', 'SE'].map(s => (
                  <th key={s} style={{ color: ROLE_COLORS[s] }}>{s}</th>
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
                  <td className={styles.verdictWinner} style={{ color: ROLE_COLORS[row.winnerShort] }}>
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
        <SectionTitle index="08" title={t('p1.s8_title')} sub={t('p1.s8_sub')} />
        <div className="projectGrid1">
          <ChartCard title={t('p1.dash_p1_caption')} delay={0.05}>
            <img src="/p1_dashboard_faceoff.png" alt={t('p1.dash_p1_caption')} style={{ width: '100%', borderRadius: 6 }} />
          </ChartCard>
          <ChartCard title={t('p1.dash_p2_caption')} delay={0.1}>
            <img src="/p1_dashboard_switching.png" alt={t('p1.dash_p2_caption')} style={{ width: '100%', borderRadius: 6 }} />
          </ChartCard>
        </div>
        <SqlCard
          title={t('p1.dax_card_title')}
          code={DAX_SNIPPET}
          href="https://github.com/GPham62/bio-data-page/raw/main/powerbi/p1/p1.pbix"
          linkLabel={t('p1.dash_download')}
          accent="var(--purple)"
        />
      </section>

    </div>
  )
}
