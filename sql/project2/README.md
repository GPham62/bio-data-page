# Project 2 — Cookie Cats A/B Test: SQL Queries

DuckDB / PostgreSQL queries for the Cookie Cats A/B testing analysis (90,189 players).

Source dataset: [Kaggle — Mobile Games A/B Testing](https://www.kaggle.com/datasets/mursideyarkin/mobile-games-ab-testing-cookie-cats)

## Query index

| File | Business question |
|------|-------------------|
| `01_retention_by_gate.sql` | What are the 1-day and 7-day retention rates for each gate group? Produces the 2×2 contingency table used in the chi-square test. |
| `02_engagement_by_gate.sql` | Does gate placement change how much players actually play? Buckets players by rounds played, removes bot outliers (> 2,000 rounds). |

## Run order

Both queries are standalone and can be run independently.

```bash
duckdb cookie_cats.duckdb < sql/project2/01_retention_by_gate.sql
duckdb cookie_cats.duckdb < sql/project2/02_engagement_by_gate.sql
```

## Source table schema (inferred from cookie_cats.csv)

| Column | Type | Notes |
|--------|------|-------|
| `userid` | INTEGER | Unique player ID |
| `version` | VARCHAR | `gate_30` or `gate_40` |
| `sum_gamerounds` | INTEGER | Total rounds played in the first 14 days |
| `retention_1` | BOOLEAN | Did the player return after 1 day? |
| `retention_7` | BOOLEAN | Did the player return after 7 days? |
