-- Project: E-Commerce Customer Segmentation
-- Question: What is each customer's RFM score, and which segment do they belong to?
-- Tables: online_retail (columns: InvoiceNo, StockCode, Description, Quantity,
--         InvoiceDate, UnitPrice, CustomerID, Country)
-- Engine: DuckDB / PostgreSQL

-- Recency   = days since the customer's last purchase (lower = better)
-- Frequency = number of distinct invoices (orders) placed
-- Monetary  = total revenue generated (Quantity * UnitPrice, net of returns)
--
-- Returns are identified by InvoiceNo starting with 'C'.
-- Rows with NULL CustomerID have no account and are excluded.
-- Rows where Quantity <= 0 or UnitPrice <= 0 are data-quality issues and are dropped.

WITH
-- Step 1: clean the raw transaction log
cleaned_transactions AS (
    SELECT
        CustomerID,
        InvoiceNo,
        InvoiceDate::DATE                                AS invoice_date,
        Quantity * UnitPrice                             AS line_revenue
    FROM  online_retail
    WHERE CustomerID   IS NOT NULL          -- anonymous sessions excluded
      AND Quantity      > 0                -- exclude returns (negative qty)
      AND UnitPrice     > 0                -- exclude cancelled / zero-price rows
      AND InvoiceNo NOT LIKE 'C%'          -- exclude credit-note invoices
),

-- Step 2: derive the analysis reference date (one day after the last transaction)
snapshot AS (
    SELECT MAX(invoice_date) + INTERVAL '1 day' AS ref_date
    FROM  cleaned_transactions
),

-- Step 3: compute raw RFM metrics per customer
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

-- Step 4: score each metric 1–5 using quintile cut-points
-- Recency is inverted: smaller recency_days → higher score
rfm_scored AS (
    SELECT
        customer_id,
        recency_days,
        frequency,
        monetary,

        -- NTILE gives quintile rank 1..5; for recency we flip the sign so
        -- a customer who bought yesterday scores 5, not 1.
        6 - NTILE(5) OVER (ORDER BY recency_days ASC)   AS r_score,
        NTILE(5)     OVER (ORDER BY frequency    ASC)   AS f_score,
        NTILE(5)     OVER (ORDER BY monetary     ASC)   AS m_score
    FROM  rfm_raw
),

-- Step 5: combine scores into a three-digit RFM code and map to a segment label
rfm_segments AS (
    SELECT
        customer_id,
        recency_days,
        frequency,
        monetary,
        r_score,
        f_score,
        m_score,
        CONCAT(r_score::TEXT, f_score::TEXT, m_score::TEXT)   AS rfm_code,

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

SELECT
    customer_id,
    recency_days,
    frequency,
    monetary,
    r_score,
    f_score,
    m_score,
    rfm_code,
    segment
FROM  rfm_segments
ORDER BY monetary DESC;
