-- Project: E-Commerce Customer Segmentation
-- Question: How many customers are in each segment, and how much revenue does each generate?
-- Tables: online_retail (same schema as 01_rfm_scoring.sql)
-- Engine: DuckDB / PostgreSQL

-- This query reuses the RFM scoring logic from 01_rfm_scoring.sql and
-- aggregates the result to the segment level for dashboard display.
-- Running both queries in sequence lets you drill from segment summary → individual customer.

WITH
cleaned_transactions AS (
    SELECT
        CustomerID,
        InvoiceNo,
        InvoiceDate::DATE                                AS invoice_date,
        Quantity * UnitPrice                             AS line_revenue
    FROM  online_retail
    WHERE CustomerID   IS NOT NULL
      AND Quantity      > 0
      AND UnitPrice     > 0
      AND InvoiceNo NOT LIKE 'C%'
),

snapshot AS (
    SELECT MAX(invoice_date) + INTERVAL '1 day' AS ref_date
    FROM  cleaned_transactions
),

rfm_raw AS (
    SELECT
        t.CustomerID                                      AS customer_id,
        DATEDIFF('day', MAX(t.invoice_date), s.ref_date) AS recency_days,
        COUNT(DISTINCT t.InvoiceNo)                       AS frequency,
        ROUND(SUM(t.line_revenue), 2)                     AS monetary
    FROM  cleaned_transactions AS t
    CROSS JOIN snapshot        AS s
    GROUP BY t.CustomerID, s.ref_date
),

rfm_scored AS (
    SELECT
        customer_id,
        recency_days,
        frequency,
        monetary,
        6 - NTILE(5) OVER (ORDER BY recency_days ASC)   AS r_score,
        NTILE(5)     OVER (ORDER BY frequency    ASC)   AS f_score,
        NTILE(5)     OVER (ORDER BY monetary     ASC)   AS m_score
    FROM  rfm_raw
),

rfm_segments AS (
    SELECT
        customer_id,
        monetary,
        CASE
            WHEN r_score >= 4 AND f_score >= 4               THEN 'Champions'
            WHEN r_score >= 3 AND f_score >= 3               THEN 'Loyal'
            WHEN r_score >= 3 AND f_score BETWEEN 1 AND 2    THEN 'Potential Loyal'
            WHEN r_score BETWEEN 2 AND 3 AND f_score >= 3    THEN 'At Risk'
            WHEN r_score <= 2 AND f_score <= 2               THEN 'Lost'
            ELSE                                                   'Hibernating'
        END                                                   AS segment
    FROM  rfm_scored
)

-- Aggregate to segment level
SELECT
    segment,
    COUNT(*)                                             AS customer_count,
    ROUND(SUM(monetary), 2)                              AS total_revenue,
    ROUND(AVG(monetary), 2)                              AS avg_revenue_per_customer,
    ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 1)  AS pct_of_customers,
    ROUND(100.0 * SUM(monetary) / SUM(SUM(monetary)) OVER (), 1) AS pct_of_revenue
FROM  rfm_segments
GROUP BY segment
ORDER BY total_revenue DESC;
