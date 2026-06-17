// ── Project 1: Recruit Analysis ─────────────────────────────
// Replace any value here with real exports from your Colab notebook.
// e.g. df_salary.groupby('job_title_short')['salary_annual'].median().reset_index().to_dict('records')

export const colabUrl = 'https://colab.research.google.com/drive/1jLuh6oGoBoDFdXSB7WcCt0wRFnNFsuc-'
export const sqlUrl   = 'https://github.com/GPham62/bio-data-page/tree/main/sql/project1'

export const salaryByTitle = [
  { title: 'Sr. Data Scientist',  salary: 149653 },
  { title: 'Sr. Data Engineer',   salary: 142300 },
  { title: 'Software Engineer',   salary: 135000 },
  { title: 'Data Engineer',       salary: 125000 },
  { title: 'ML Engineer',         salary: 125000 },
  { title: 'Data Scientist',      salary: 119600 },
  { title: 'Cloud Engineer',      salary: 115000 },
  { title: 'Sr. Data Analyst',    salary: 110000 },
  { title: 'Business Analyst',    salary:  90658 },
  { title: 'Data Analyst',        salary:  82500 },
]

export const topCountries = [
  { country: 'United States', postings: 410000 },
  { country: 'India',         postings:  85000 },
  { country: 'United Kingdom',postings:  62000 },
  { country: 'Germany',       postings:  48000 },
  { country: 'France',        postings:  38000 },
  { country: 'Canada',        postings:  36000 },
  { country: 'Australia',     postings:  30000 },
  { country: 'Brazil',        postings:  22000 },
  { country: 'Netherlands',   postings:  18000 },
  { country: 'Spain',         postings:  15000 },
]

export const remoteByTitle = [
  { title: 'Sr. Data Engineer',  pct: 14.4 },
  { title: 'Data Engineer',      pct: 11.2 },
  { title: 'ML Engineer',        pct: 11.1 },
  { title: 'Sr. Data Scientist', pct: 10.4 },
  { title: 'Data Scientist',     pct:  8.9 },
  { title: 'Sr. Data Analyst',   pct:  7.9 },
  { title: 'Software Engineer',  pct:  7.6 },
  { title: 'Data Analyst',       pct:  6.7 },
  { title: 'Business Analyst',   pct:  6.1 },
  { title: 'Cloud Engineer',     pct:  4.4 },
]

export const topSkills = [
  { skill: 'SQL',        count: 385000 },
  { skill: 'Python',     count: 362000 },
  { skill: 'Tableau',    count: 210000 },
  { skill: 'R',          count: 190000 },
  { skill: 'Excel',      count: 185000 },
  { skill: 'Power BI',   count: 160000 },
  { skill: 'Spark',      count: 142000 },
  { skill: 'Azure',      count: 135000 },
  { skill: 'AWS',        count: 128000 },
  { skill: 'Looker',     count:  95000 },
]

export const monthlyTrend = [
  { month: 'Jul 24', postings:  51152, remote: 13.6 },
  { month: 'Aug 24', postings:  47748, remote: 12.0 },
  { month: 'Sep 24', postings:  30215, remote: 10.5 },
  { month: 'Oct 24', postings:  19052, remote:  7.8 },
  { month: 'Nov 24', postings:  13779, remote:  8.6 },
  { month: 'Dec 24', postings:  34117, remote:  8.3 },
  { month: 'Jan 25', postings:  67650, remote:  4.2 },
  { month: 'Feb 25', postings:  84548, remote:  2.8 },
  { month: 'Mar 25', postings:  73505, remote:  3.1 },
  { month: 'Apr 25', postings:  44880, remote:  2.9 },
  { month: 'May 25', postings:  40404, remote:  3.9 },
  { month: 'Jun 25', postings:  33628, remote:  4.8 },
]

// Binary classification: does a posting pay ABOVE the median salary?
// target  = high_pay  (1 if salary > median, else 0) — classes are ~balanced.
// features = role, seniority, country and the 10 skills (one-hot encoded).
// Reported on a held-out test set.
export const mlResults = {
  model:     'Gradient Boosting Classifier',
  target:    'High pay (above median salary)',
  threshold: 110000, // median salary used to split the two classes
  accuracy:  0.80,
  rocAuc:    0.85,
  precision: 0.79,
  recall:    0.82,
  f1:        0.80,
  baseline:  0.50, // median split → balanced classes, so chance ≈ 50%
  trainSize: 50101,
  testSize:  12526,
  // Feature importance from the classifier. `importance` = relative predictive
  // weight (%, sums to 100). `direction` = +1 if the feature pushes a posting
  // toward HIGH pay, -1 if toward LOW pay. Sorted most-important first.
  featureImportance: [
    { feature: 'Senior role',        importance: 24, direction:  1 },
    { feature: 'Engineer role',      importance: 17, direction:  1 },
    { feature: 'Based in US',        importance: 14, direction:  1 },
    { feature: 'Spark',              importance: 11, direction:  1 },
    { feature: 'Cloud (AWS/Azure)',  importance:  9, direction:  1 },
    { feature: 'Python',             importance:  7, direction:  1 },
    { feature: 'Excel',              importance:  6, direction: -1 },
    { feature: 'Analyst role',       importance:  5, direction: -1 },
    { feature: 'Power BI',           importance:  4, direction: -1 },
    { feature: 'Emerging-market geo',importance:  3, direction: -1 },
  ],
}

export const stats = {
  totalPostings:  1615930,
  countriesCovered: 160,
  salaryRecords:   77072,
  dateRange:      '2023 – 2025',
  medianSalary:   110000,
  topRole:        'Data Analyst',
  topSkill:       'SQL',
}
