# Project 3 — E-Commerce Customer Segmentation: SQL Queries

DuckDB / PostgreSQL queries for the RFM segmentation and cohort retention analysis
(541,909 transactions, 4,372 customers, Dec 2010 – Dec 2011).

Source dataset: [Kaggle — E-Commerce Data (UCI Online Retail)](https://www.kaggle.com/datasets/carrie1/ecommerce-data)

## Query index

| File | Business question |
|------|-------------------|
| `01_rfm_scoring.sql` | What is each customer's Recency, Frequency, and Monetary score, and which segment do they belong to? Uses `NTILE(5)` window functions to assign quintile scores. |
| `02_segment_revenue.sql` | How many customers are in each segment, and how much revenue does each segment generate? Aggregates the RFM result to segment level with revenue share percentages. |
| `03_cohort_retention.sql` | What percentage of customers from each monthly cohort return in subsequent months? Produces the month-offset retention table that feeds the heatmap. |

## Run order

Run in sequence — `02` and `03` share the same data-cleaning logic as `01` and can be run independently of each other, but both depend on the same source table.

```bash
duckdb ecommerce.duckdb < sql/project3/01_rfm_scoring.sql
duckdb ecommerce.duckdb < sql/project3/02_segment_revenue.sql
duckdb ecommerce.duckdb < sql/project3/03_cohort_retention.sql
```

## Source table schema (online_retail)

| Column | Type | Notes |
|--------|------|-------|
| `InvoiceNo` | VARCHAR | Order ID; prefix `C` = credit note (return) |
| `StockCode` | VARCHAR | Product code |
| `Description` | VARCHAR | Product name |
| `Quantity` | INTEGER | Units ordered; negative = return |
| `InvoiceDate` | TIMESTAMP | Order date and time |
| `UnitPrice` | NUMERIC | Price per unit in GBP |
| `CustomerID` | NUMERIC | Customer account number; NULL = anonymous |
| `Country` | VARCHAR | Customer country |
