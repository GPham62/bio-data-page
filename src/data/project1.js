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

export const mlResults = {
  winner:    'Linear Regression',
  r2:        0.35,
  mae:       29724,
  rmse:      40842,
  trainSize: 50101,
  testSize:  12526,
  topBoosters: [
    { feature: 'Contractor schedule', impact: +38 },
    { feature: 'Sr. Data Engineer',   impact: +22 },
    { feature: 'Sr. Data Scientist',  impact: +19 },
    { feature: 'Yearly salary source',impact: +14 },
    { feature: 'Remote work',         impact:  +9 },
  ],
  topReducers: [
    { feature: 'Data Analyst title',  impact: -28 },
    { feature: 'Internship schedule', impact: -24 },
    { feature: 'Part-time schedule',  impact: -18 },
    { feature: 'Business Analyst',    impact: -12 },
    { feature: 'Hourly converted',    impact:  -9 },
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
