# Project 1 — Global Tech Recruit Analysis: SQL Pipeline

DuckDB/MotherDuck pipeline that ingests 1.6 M job postings and builds a set of analytical marts powering the dashboard at [bio-ta.vercel.app](https://bio-ta.vercel.app/).

## Run order

| File | What it does |
|------|-------------|
| `01_schema.sql` | Create source tables with FK constraints |
| `02_load_data.sql` | Load CSVs from GCS into source tables |
| `03_flat_mart.sql` | Denormalised flat mart — one row per job, skills as an array |
| `04_skills_mart.sql` | Star schema for skill demand: `skills_dim`, `date_month_dim`, `fact_skill_demand_monthly` |
| `05_priority_mart_create.sql` | Snapshot table for priority roles (Data Analyst / Scientist / Engineer) |
| `06_priority_mart_update.sql` | SCD-style MERGE to keep the snapshot current |
| `07_company_mart.sql` | Company, location, job-title dims + `fact_company_hiring_monthly` |

## Quick start

```bash
duckdb recruit.duckdb < sql/project1/01_schema.sql
duckdb recruit.duckdb < sql/project1/02_load_data.sql
duckdb recruit.duckdb < sql/project1/03_flat_mart.sql
duckdb recruit.duckdb < sql/project1/04_skills_mart.sql
duckdb recruit.duckdb < sql/project1/05_priority_mart_create.sql
duckdb recruit.duckdb < sql/project1/06_priority_mart_update.sql
duckdb recruit.duckdb < sql/project1/07_company_mart.sql
```

Source data is publicly available on Google Cloud Storage (`gs://sql_de/`).
