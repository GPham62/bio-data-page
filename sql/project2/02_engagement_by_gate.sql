-- Project: Cookie Cats A/B Test
-- Question: Does gate placement change how much players actually play?
-- Tables: cookie_cats (columns: userid, version, sum_gamerounds, retention_1, retention_7)
-- Engine: DuckDB / PostgreSQL

-- We bucket players by rounds played so the distribution is visible at a glance.
-- Outliers (sum_gamerounds > 2000) are capped via the WHERE clause — they are
-- almost certainly bots and would skew the median and mean materially.

WITH cleaned AS (
    SELECT
        userid,
        version                                          AS gate_group,
        sum_gamerounds
    FROM  cookie_cats
    WHERE version          IN ('gate_30', 'gate_40')
      AND sum_gamerounds   <= 2000                       -- remove bot outliers
),

bucketed AS (
    SELECT
        gate_group,
        CASE
            WHEN sum_gamerounds = 0             THEN '0'
            WHEN sum_gamerounds BETWEEN 1 AND 10   THEN '1-10'
            WHEN sum_gamerounds BETWEEN 11 AND 20  THEN '11-20'
            WHEN sum_gamerounds BETWEEN 21 AND 50  THEN '21-50'
            WHEN sum_gamerounds BETWEEN 51 AND 100 THEN '51-100'
            WHEN sum_gamerounds BETWEEN 101 AND 500 THEN '101-500'
            ELSE '500+'
        END                                              AS rounds_bucket,
        COUNT(*)                                         AS player_count
    FROM  cleaned
    GROUP BY gate_group, rounds_bucket
)

SELECT
    rounds_bucket,
    SUM(CASE WHEN gate_group = 'gate_30' THEN player_count ELSE 0 END) AS gate_30_players,
    SUM(CASE WHEN gate_group = 'gate_40' THEN player_count ELSE 0 END) AS gate_40_players
FROM  bucketed
GROUP BY rounds_bucket
ORDER BY
    CASE rounds_bucket
        WHEN '0'       THEN 1
        WHEN '1-10'    THEN 2
        WHEN '11-20'   THEN 3
        WHEN '21-50'   THEN 4
        WHEN '51-100'  THEN 5
        WHEN '101-500' THEN 6
        ELSE                7
    END;
