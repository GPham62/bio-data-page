// Project 4 — Recruitment Data Warehouse
//
// Every figure here is countable from the SQL in `sql/project1/`. Nothing is
// estimated. If the pipeline gains a table, update this file and the KPI in
// Project4.jsx together, or the page starts claiming something the code
// does not back.
//
// Counted from CREATE TABLE statements, 2026-07-20:
//   01_schema.sql            4 source tables
//   03_flat_mart.sql         1
//   04_skills_mart.sql       3
//   05_priority_mart_create  2
//   07_company_mart.sql      8
//                           -- 18 total across 5 schemas

export const stats = {
  postings: '1.6M',
  sourceCsvs: 4,
  tables: 18,
  schemas: 5,
  marts: 4,
}

// Tables per schema. `source` is the default schema the CSVs land in.
export const schemaSizes = [
  { schema: 'company_mart',  tables: 8, kind: 'mart' },
  { schema: 'source',        tables: 4, kind: 'source' },
  { schema: 'skills_mart',   tables: 3, kind: 'mart' },
  { schema: 'priority_mart', tables: 2, kind: 'mart' },
  { schema: 'flat_mart',     tables: 1, kind: 'mart' },
]

// The four source CSVs, loaded from gs://sql_de/ by 02_load_data.sql.
export const sourceTables = [
  { name: 'job_postings_fact', role: 'fact' },
  { name: 'company_dim',       role: 'dim' },
  { name: 'skills_dim',        role: 'dim' },
  { name: 'skills_job_dim',    role: 'bridge' },
]

// Each mart, its grain, and how it refreshes. `refresh` is the honest bit:
// only the priority mart is genuinely incremental.
export const marts = [
  {
    schema: 'flat_mart',
    grain: 'one row per job posting',
    tables: ['job_postings'],
    refresh: 'rebuild',
    file: '03_flat_mart.sql',
  },
  {
    schema: 'skills_mart',
    grain: 'one row per skill per month',
    tables: ['skills_dim', 'date_month_dim', 'fact_skill_demand_monthly'],
    refresh: 'rebuild',
    file: '04_skills_mart.sql',
  },
  {
    schema: 'priority_mart',
    grain: 'one row per tracked job posting',
    tables: ['priority_roles', 'priority_jobs_snapshot'],
    refresh: 'incremental',
    file: '06_priority_mart_update.sql',
  },
  {
    schema: 'company_mart',
    grain: 'one row per company per month',
    tables: [
      'company_dim', 'location_dim', 'company_location_dim',
      'job_title_dim', 'job_title_short_dim', 'job_title_bridge',
      'date_month_dim', 'fact_company_hiring_monthly',
    ],
    refresh: 'rebuild',
    file: '07_company_mart.sql',
  },
]

export const sqlUrl = 'https://github.com/GPham62/bio-data-page/tree/main/sql/project1'
export const gcsUrl = 'https://storage.googleapis.com/sql_de/'
