// ── Project 1: Recruit Analysis ─────────────────────────────
// Replace any value here with real exports from your Colab notebook.
// e.g. df_salary.groupby('job_title_short')['salary_annual'].median().reset_index().to_dict('records')

export const salaryByTitle = [
  { title: 'Sr. Data Scientist',  salary: 157500 },
  { title: 'Sr. Data Engineer',   salary: 147500 },
  { title: 'Software Engineer',   salary: 140000 },
  { title: 'Data Scientist',      salary: 135000 },
  { title: 'ML Engineer',         salary: 133500 },
  { title: 'Data Engineer',       salary: 127500 },
  { title: 'Cloud Engineer',      salary: 118000 },
  { title: 'Sr. Data Analyst',    salary: 112500 },
  { title: 'Business Analyst',    salary:  95000 },
  { title: 'Data Analyst',        salary:  90000 },
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
  { title: 'Sr. Data Engineer',  pct: 14.2 },
  { title: 'Data Engineer',      pct: 13.1 },
  { title: 'ML Engineer',        pct: 12.7 },
  { title: 'Sr. Data Scientist', pct: 11.9 },
  { title: 'Data Scientist',     pct: 11.3 },
  { title: 'Software Engineer',  pct:  9.8 },
  { title: 'Cloud Engineer',     pct:  9.1 },
  { title: 'Sr. Data Analyst',   pct:  7.4 },
  { title: 'Data Analyst',       pct:  6.2 },
  { title: 'Business Analyst',   pct:  4.9 },
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
  { month: 'Jan 23', postings: 48000, remote: 8.1 },
  { month: 'Mar 23', postings: 62000, remote: 8.9 },
  { month: 'May 23', postings: 71000, remote: 9.4 },
  { month: 'Jul 23', postings: 68000, remote: 9.8 },
  { month: 'Sep 23', postings: 75000, remote: 10.2 },
  { month: 'Nov 23', postings: 79000, remote: 10.8 },
  { month: 'Jan 24', postings: 83000, remote: 11.3 },
  { month: 'Mar 24', postings: 88000, remote: 11.9 },
  { month: 'May 24', postings: 91000, remote: 12.1 },
  { month: 'Jul 24', postings: 87000, remote: 12.4 },
  { month: 'Sep 24', postings: 94000, remote: 12.8 },
  { month: 'Nov 24', postings: 98000, remote: 13.1 },
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
  countriesCovered: 151,
  salaryRecords:   77072,
  dateRange:      '2023 – 2025',
  medianSalary:   110000,
  topRole:        'Data Analyst',
  topSkill:       'SQL',
}
