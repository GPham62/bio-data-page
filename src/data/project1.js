// ── Project 1: Recruit Analysis ─────────────────────────────

export const pythonUrl = 'https://github.com/GPham62/bio-data-page/blob/main/project1_analysis.py'
export const sqlUrl    = 'https://github.com/GPham62/bio-data-page/tree/main/sql/project1'

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

// Regression: predicting US annual salary from role, seniority, skills, and state.
// target  = salary_year_avg (continuous, USD/year), US postings only
// features = top-50 skill flags + skill_count + ordinal seniority (parsed from raw
//   job_title) + role one-hot + top-10 state dummies + extras (remote, health,
//   no-degree) + skill-interaction flags (79 total).
// Restricting to the US and adding a granular seniority tier lifted test R² from 0.33 → 0.53.
// HistGradientBoosting won a 5-fold CV bake-off (vs Linear, Ridge, Random Forest).
// Evaluated on a held-out 20% test set + 5-fold CV; importance = permutation importance (top 12).
// NOTE: run the Colab notebook (Section 10) and paste the printed export block to update these values.
export const mlResults = {
  task:        'Regression',
  model:       'HistGradientBoosting',
  target:      'US annual salary (salary_year_avg)',
  r2:          0.53,
  mae:         22300,
  baselineMae: 36500,
  cvR2:        0.54,
  trainR2:     0.61,
  nFeatures:   79,
  trainSize:   31554,
  testSize:    7889,
  featureImportance: [
    { feature: 'Seniority',             importance: 47.4, direction:  1 },
    { feature: 'Data Analyst',          importance: 17.6, direction: -1 },
    { feature: 'Skill Count',           importance:  8.9, direction:  1 },
    { feature: 'State CA',              importance:  7.3, direction:  1 },
    { feature: 'Senior Data Scientist', importance:  3.3, direction:  1 },
    { feature: 'Python',                importance:  2.7, direction:  1 },
    { feature: 'Health Insurance',      importance:  2.7, direction:  1 },
    { feature: 'Excel',                 importance:  2.3, direction: -1 },
    { feature: 'Senior Data Analyst',   importance:  2.1, direction: -1 },
    { feature: 'State NY',              importance:  2.0, direction:  1 },
    { feature: 'Business Analyst',      importance:  1.9, direction: -1 },
    { feature: 'State NA',              importance:  1.7, direction:  1 },
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
