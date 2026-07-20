import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import StatCard     from '../components/StatCard.jsx'
import SectionTitle from '../components/SectionTitle.jsx'
import ChartCard    from '../components/ChartCard.jsx'
import ChartTooltip from '../components/ChartTooltip.jsx'
import InsightBlock from '../components/InsightBlock.jsx'
import SqlCard      from '../components/SqlCard.jsx'
import { gridProps, axisMuted, axisStrong } from '../utils/chartTheme.js'
import { stats, schemaSizes, sourceTables, marts, sqlUrl, gcsUrl } from '../data/project4.js'
import styles from './Project4.module.css'

// Verbatim from sql/project1/06_priority_mart_update.sql. Kept in sync by hand:
// if that file changes, this snippet has to change with it.
const MERGE_SNIPPET = `-- Incremental update: MERGE keeps priority_jobs_snapshot current
-- without a full reload
MERGE INTO priority_mart.priority_jobs_snapshot AS tgt
USING src_priority_jobs AS src ON tgt.job_id = src.job_id
WHEN MATCHED AND tgt.priority_lvl IS DISTINCT FROM src.priority_lvl THEN
    UPDATE SET priority_lvl = src.priority_lvl, updated_at = src.updated_at
WHEN NOT MATCHED THEN
    INSERT (job_id, job_title_short, company_name, job_posted_date,
            salary_year_avg, priority_lvl, updated_at)
    VALUES (src.job_id, src.job_title_short, src.company_name,
            src.job_posted_date, src.salary_year_avg,
            src.priority_lvl, src.updated_at)
WHEN NOT MATCHED BY SOURCE THEN DELETE;`

const LOAD_SNIPPET = `-- Load source CSVs straight from GCS into DuckDB
INSERT INTO job_postings_fact (
    job_id, company_id, job_title_short, job_title, job_location, job_via,
    job_schedule_type, job_work_from_home, search_location, job_posted_date,
    job_no_degree_mention, job_health_insurance, job_country,
    salary_rate, salary_year_avg, salary_hour_avg
)
SELECT
    job_id, company_id, job_title_short, job_title, job_location, job_via,
    job_schedule_type, job_work_from_home, search_location, job_posted_date,
    job_no_degree_mention, job_health_insurance, job_country,
    salary_rate, salary_year_avg, salary_hour_avg
FROM read_csv('https://storage.googleapis.com/sql_de/job_postings_fact.csv',
              AUTO_DETECT=true);`

const NODE_CLASS = {
  fact:   styles.schemaNodeFact,
  dim:    styles.schemaNodeDim,
  bridge: styles.schemaNodeBridge,
}

const BAR_COLOR = { source: '#00e5ff', mart: '#00cc96' }

export default function Project4({ setActive }) {
  const { t } = useTranslation()

  return (
    <div className="projectPage" style={{ position: 'relative' }}>
      <button className="prev-btn" onClick={() => setActive('p3')}>
        {t('nav.p3')}
      </button>
      <button className="next-btn" onClick={() => setActive('home')}>
        {t('nav.home')}
      </button>

      {/* Hero */}
      <section className="projectHero fade-up">
        <div className="projectHeroMeta">
          <span className={styles.tag}>{t('p4.tag')}</span>
          <span className={styles.tag} style={{ borderColor: 'rgba(163,113,247,0.3)', color: 'var(--purple)' }}>
            {t('p4.tag2')}
          </span>
        </div>
        <h1 className="projectHeroTitle">
          {t('p4.title1')}<br />
          <span className={styles.heroAccent}>{t('p4.title2')}</span>
        </h1>
        <p className="projectHeroSub">{t('p4.sub')}</p>
        <div className="projectHeroStack">
          {['SQL', 'DuckDB', 'MotherDuck', 'Google Cloud Storage'].map(tech => (
            <span key={tech} className="projectPill">{tech}</span>
          ))}
        </div>
        <div className={styles.linkRow}>
          <a className={styles.sqlLink} href={sqlUrl} target="_blank" rel="noopener noreferrer">
            {t('p4.sql_link')} <span aria-hidden>↗</span>
          </a>
          <a className={styles.gcsLink} href={gcsUrl} target="_blank" rel="noopener noreferrer">
            {t('p4.gcs_link')} <span aria-hidden>↗</span>
          </a>
        </div>
      </section>

      {/* KPIs */}
      <section className={styles.kpiRow}>
        <StatCard label={t('p4.kpi_postings')} value={stats.postings}          sub={t('p4.kpi_postings_sub')} accent="var(--green)"   delay={0.05} />
        <StatCard label={t('p4.kpi_sources')}  value={String(stats.sourceCsvs)} sub={t('p4.kpi_sources_sub')}  accent="var(--accent)"  delay={0.10} />
        <StatCard label={t('p4.kpi_tables')}   value={String(stats.tables)}     sub={t('p4.kpi_tables_sub')}   accent="var(--purple)"  delay={0.15} />
        <StatCard label={t('p4.kpi_schemas')}  value={String(stats.schemas)}    sub={t('p4.kpi_schemas_sub')}  accent="var(--accent2)" delay={0.20} />
      </section>

      {/* Section 1: why model it at all */}
      <section className="projectSection">
        <SectionTitle index="01" title={t('p4.s1_title')} sub={t('p4.s1_sub')} fxIndex fxTitle />
        <div className="projectGrid2">
          <ChartCard title={t('p4.chart_schema_sizes')} sub={t('p4.chart_schema_sizes_sub')} delay={0.05}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={schemaSizes} layout="vertical" margin={{ left: 0, right: 24 }}>
                <CartesianGrid {...gridProps} horizontal={false} />
                <XAxis type="number" allowDecimals={false} {...axisMuted} />
                <YAxis type="category" dataKey="schema" width={110} {...axisStrong} />
                <Tooltip content={<ChartTooltip color="#00cc96" />} />
                <Bar dataKey="tables" name={t('p4.unit_tables')} radius={[0, 3, 3, 0]}>
                  {schemaSizes.map(row => (
                    <Cell key={row.schema} fill={BAR_COLOR[row.kind]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <SqlCard
            title={t('p4.sql_load_title')}
            code={LOAD_SNIPPET}
            href={`${sqlUrl}/02_load_data.sql`}
            linkLabel={t('p4.sql_view')}
            accent="var(--accent)"
          />
        </div>
        <InsightBlock label={t('p4.insight_label')} text={t('p4.s1_insight')} accent="var(--green)" />
      </section>

      {/* Section 2: the star schema */}
      <section className="projectSection">
        <SectionTitle index="02" title={t('p4.s2_title')} sub={t('p4.s2_sub')} fxIndex fxTitle />

        <div className={styles.schemaBox}>
          <div className={styles.schemaFlow}>
            <div className={styles.schemaStage}>
              <span className={styles.schemaStageLabel}>{t('p4.flow_source')}</span>
              {sourceTables.map(tbl => (
                <div key={tbl.name} className={`${styles.schemaNode} ${NODE_CLASS[tbl.role]}`}>
                  {tbl.name}
                  <span className={styles.schemaNodeSub}>{t(`p4.role_${tbl.role}`)}</span>
                </div>
              ))}
            </div>

            <div className={styles.schemaArrow} aria-hidden>→</div>

            <div className={styles.schemaStage}>
              <span className={styles.schemaStageLabel}>{t('p4.flow_warehouse')}</span>
              <div className={`${styles.schemaNode} ${styles.schemaNodeFact}`}>
                DuckDB
                <span className={styles.schemaNodeSub}>{t('p4.flow_warehouse_sub')}</span>
              </div>
            </div>

            <div className={styles.schemaArrow} aria-hidden>→</div>

            <div className={styles.schemaStage}>
              <span className={styles.schemaStageLabel}>{t('p4.flow_marts')}</span>
              {marts.map(mart => (
                <div key={mart.schema} className={`${styles.schemaNode} ${styles.schemaNodeDim}`}>
                  {mart.schema}
                  <span className={styles.schemaNodeSub}>
                    {mart.tables.length} {t('p4.unit_tables')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.schemaLegend}>
            <span className={styles.schemaLegendItem}>
              <span className={styles.schemaSwatch} style={{ background: 'var(--green)' }} />
              {t('p4.role_fact')}
            </span>
            <span className={styles.schemaLegendItem}>
              <span className={styles.schemaSwatch} style={{ background: 'var(--accent)' }} />
              {t('p4.role_dim')}
            </span>
            <span className={styles.schemaLegendItem}>
              <span className={styles.schemaSwatch} style={{ background: 'var(--purple)' }} />
              {t('p4.role_bridge')}
            </span>
          </div>
        </div>

        <InsightBlock label={t('p4.insight_label')} text={t('p4.s2_insight')} accent="var(--accent)" />
      </section>

      {/* Section 3: refresh strategy */}
      <section className="projectSection">
        <SectionTitle index="03" title={t('p4.s3_title')} sub={t('p4.s3_sub')} fxIndex fxTitle />

        <div className={styles.martTableWrap}>
          <table className={styles.martTable}>
            <thead>
              <tr>
                <th>{t('p4.col_schema')}</th>
                <th>{t('p4.col_grain')}</th>
                <th style={{ textAlign: 'right' }}>{t('p4.col_tables')}</th>
                <th>{t('p4.col_refresh')}</th>
              </tr>
            </thead>
            <tbody>
              {marts.map(mart => (
                <tr key={mart.schema}>
                  <td className={styles.martSchema}>{mart.schema}</td>
                  <td className={styles.martGrain}>{t(`p4.grain_${mart.schema}`)}</td>
                  <td className={styles.martCount}>{mart.tables.length}</td>
                  <td>
                    <span
                      className={`${styles.refreshBadge} ${
                        mart.refresh === 'incremental' ? styles.refreshIncremental : styles.refreshRebuild
                      }`}
                    >
                      {t(`p4.refresh_${mart.refresh}`)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: '1.5rem' }}>
          <SqlCard
            title={t('p4.sql_merge_title')}
            code={MERGE_SNIPPET}
            href={`${sqlUrl}/06_priority_mart_update.sql`}
            linkLabel={t('p4.sql_view')}
            accent="var(--green)"
          />
        </div>

        <InsightBlock label={t('p4.insight_label')} text={t('p4.s3_insight')} accent="var(--purple)" />
      </section>
    </div>
  )
}
