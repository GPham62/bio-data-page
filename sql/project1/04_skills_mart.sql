-- Skills mart: star schema tracking monthly skill demand across 1.6M postings
DROP SCHEMA IF EXISTS skills_mart CASCADE;
CREATE SCHEMA IF NOT EXISTS skills_mart;

-- Dimension: skills
CREATE TABLE skills_mart.skills_dim (
    skill_id INTEGER PRIMARY KEY,
    skills   VARCHAR,
    type     VARCHAR
);

INSERT INTO skills_mart.skills_dim (skill_id, skills, type)
SELECT skill_id, skills, type FROM skills_dim;

-- Dimension: calendar month
CREATE TABLE skills_mart.date_month_dim (
    month_start_date DATE PRIMARY KEY,
    year             INTEGER,
    month            INTEGER,
    quarter          INTEGER,
    quarter_name     VARCHAR,
    year_quarter     VARCHAR
);

INSERT INTO skills_mart.date_month_dim
SELECT DISTINCT
    DATE_TRUNC('month', job_posted_date)                                      AS month_start_date,
    EXTRACT(YEAR    FROM job_posted_date)                                      AS year,
    EXTRACT(MONTH   FROM job_posted_date)                                      AS month,
    EXTRACT(QUARTER FROM job_posted_date)                                      AS quarter,
    'Q-' || EXTRACT(QUARTER FROM job_posted_date)::VARCHAR                    AS quarter_name,
    EXTRACT(YEAR FROM job_posted_date)::VARCHAR
        || '-Q' || EXTRACT(QUARTER FROM job_posted_date)::VARCHAR             AS year_quarter
FROM job_postings_fact
ORDER BY month_start_date;

-- Fact: monthly skill demand
CREATE TABLE skills_mart.fact_skill_demand_monthly (
    skill_id                        INTEGER,
    month_start_date                DATE,
    job_title_short                 VARCHAR,
    postings_count                  INTEGER,
    remote_postings_count           INTEGER,
    health_insurance_postings_count INTEGER,
    no_degree_postings_count        INTEGER,
    PRIMARY KEY (skill_id, month_start_date, job_title_short),
    FOREIGN KEY (skill_id)         REFERENCES skills_mart.skills_dim(skill_id),
    FOREIGN KEY (month_start_date) REFERENCES skills_mart.date_month_dim(month_start_date)
);

-- Populate: convert boolean flags to integers, then aggregate by month
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
INSERT INTO skills_mart.fact_skill_demand_monthly
SELECT
    skill_id,
    month_start_date,
    job_title_short,
    COUNT(*)                  AS postings_count,
    SUM(is_remote)            AS remote_postings_count,
    SUM(has_health_insurance) AS health_insurance_postings_count,
    SUM(no_degree_mentioned)  AS no_degree_postings_count
FROM  job_postings_prep
GROUP BY ALL
ORDER BY skill_id, month_start_date, job_title_short;

-- Validation
SELECT 'skills_dim'              AS table_name, COUNT(*) AS rows FROM skills_mart.skills_dim
UNION ALL
SELECT 'date_month_dim',                        COUNT(*) FROM skills_mart.date_month_dim
UNION ALL
SELECT 'fact_skill_demand_monthly',             COUNT(*) FROM skills_mart.fact_skill_demand_monthly;
