-- Skill ROI: salary premium vs demand for mid-level Data Analyst postings.
-- Level-controlled: senior/junior titles are excluded first, so a skill can't
-- look "high-paying" just because seniors happen to list it.
-- premium_usd = median salary WITH the skill − median salary WITHOUT it.

WITH mid_da AS (               -- mid-level DA postings with a usable salary
    SELECT job_id, salary_year_avg
    FROM job_postings_fact
    WHERE job_title_short = 'Data Analyst'
      AND salary_year_avg BETWEEN 10000 AND 600000
      AND NOT regexp_matches(LOWER(COALESCE(job_title, '')),
                             'senior|sr[. ]|staff|principal|lead')
      AND NOT regexp_matches(LOWER(COALESCE(job_title, '')),
                             'junior|jr[. ]|entry|intern|graduate|trainee')
),
job_skills AS (                -- one row per (job, skill)
    SELECT DISTINCT m.job_id, m.salary_year_avg, sd.skills AS skill
    FROM mid_da m
    JOIN skills_job_dim sjd ON sjd.job_id  = m.job_id
    JOIN skills_dim     sd  ON sd.skill_id = sjd.skill_id
),
top_skills AS (                -- 12 most-demanded skills
    SELECT skill
    FROM job_skills
    GROUP BY skill
    ORDER BY COUNT(*) DESC
    LIMIT 12
),
job_salary AS (                -- one salary per job
    SELECT DISTINCT job_id, salary_year_avg FROM job_skills
),
flags AS (                     -- every job × every top skill, with/without flag
    SELECT t.skill, j.job_id, j.salary_year_avg,
           k.job_id IS NOT NULL AS has_skill
    FROM top_skills t
    CROSS JOIN job_salary j
    LEFT JOIN job_skills k ON k.job_id = j.job_id AND k.skill = t.skill
)
SELECT
    skill,
    ROUND(MEDIAN(salary_year_avg) FILTER (has_skill)
        - MEDIAN(salary_year_avg) FILTER (NOT has_skill), 0) AS premium_usd,
    ROUND(100.0 * COUNT(*) FILTER (has_skill) / COUNT(*), 1) AS demand_pct,
    COUNT(*) FILTER (has_skill)                              AS n_with_skill
FROM flags
GROUP BY skill
ORDER BY premium_usd DESC;
