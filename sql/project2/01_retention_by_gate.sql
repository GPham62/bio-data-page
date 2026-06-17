-- Project: Cookie Cats A/B Test
-- Question: What are the 1-day and 7-day retention rates for each gate group?
-- Tables: cookie_cats (columns: userid, version, sum_gamerounds, retention_1, retention_7)
-- Engine: DuckDB / PostgreSQL

-- Retention rate = players who returned / total players in that group.
-- retention_1 and retention_7 are boolean columns (TRUE if the player returned).
-- We cast to integer before averaging so the mean equals the proportion.

SELECT
    version                                              AS gate_group,
    COUNT(*)                                             AS total_players,
    ROUND(AVG(retention_1::INTEGER) * 100, 2)           AS retention_1day_pct,
    ROUND(AVG(retention_7::INTEGER) * 100, 2)           AS retention_7day_pct,

    -- raw counts for the chi-square contingency table
    SUM(retention_1::INTEGER)                            AS returned_day1,
    SUM(retention_7::INTEGER)                            AS returned_day7,
    COUNT(*) - SUM(retention_1::INTEGER)                 AS not_returned_day1,
    COUNT(*) - SUM(retention_7::INTEGER)                 AS not_returned_day7
FROM  cookie_cats
WHERE version IN ('gate_30', 'gate_40')   -- exclude any stray rows
GROUP BY version
ORDER BY version;
