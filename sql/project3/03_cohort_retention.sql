-- Project: E-Commerce Customer Segmentation
-- Question: What percentage of customers from each monthly cohort return in subsequent months?
-- Tables: online_retail (same schema as 01_rfm_scoring.sql)
-- Engine: DuckDB / PostgreSQL

-- A cohort is defined by the month of a customer's FIRST purchase.
-- Month offset 0 is always 100% (every customer is active in their first month).
-- The heatmap in the portfolio maps directly to the pivoted output below.

WITH
cleaned_transactions AS (
    SELECT
        CustomerID,
        InvoiceNo,
        DATE_TRUNC('month', InvoiceDate::DATE)           AS invoice_month
    FROM  online_retail
    WHERE CustomerID   IS NOT NULL
      AND Quantity      > 0
      AND UnitPrice     > 0
      AND InvoiceNo NOT LIKE 'C%'
),

-- Step 1: identify each customer's cohort (first purchase month)
first_purchase AS (
    SELECT
        CustomerID,
        MIN(invoice_month)                               AS cohort_month
    FROM  cleaned_transactions
    GROUP BY CustomerID
),

-- Step 2: for every (customer, month) pair, compute how many months
-- have elapsed since their cohort month
customer_activity AS (
    SELECT
        t.CustomerID,
        fp.cohort_month,
        t.invoice_month,
        DATEDIFF('month', fp.cohort_month, t.invoice_month) AS month_offset
    FROM  cleaned_transactions        AS t
    JOIN  first_purchase              AS fp ON t.CustomerID = fp.CustomerID
),

-- Step 3: count distinct active customers per cohort × month-offset cell
cohort_counts AS (
    SELECT
        cohort_month,
        month_offset,
        COUNT(DISTINCT CustomerID)                       AS active_customers
    FROM  customer_activity
    GROUP BY cohort_month, month_offset
),

-- Step 4: get the cohort size (month 0 count) for the denominator
cohort_sizes AS (
    SELECT
        cohort_month,
        active_customers                                 AS cohort_size
    FROM  cohort_counts
    WHERE month_offset = 0
)

-- Step 5: compute retention rate for each cell
SELECT
    TO_CHAR(cc.cohort_month, 'Mon YY')                  AS cohort,
    cc.month_offset,
    cc.active_customers,
    cs.cohort_size,
    ROUND(100.0 * cc.active_customers / cs.cohort_size, 1) AS retention_pct
FROM  cohort_counts AS cc
JOIN  cohort_sizes  AS cs ON cc.cohort_month = cs.cohort_month
ORDER BY cc.cohort_month, cc.month_offset;
