// Export the hardcoded Project 1 arrays from src/data/project1.js into CSV files
// for a Power BI Desktop import. Run:  node powerbi/export_project1.mjs
import { writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import {
  salaryByTitle, topCountries, remoteByTitle,
  topSkills, monthlyTrend, mlResults, stats,
} from '../src/data/project1.js'

const outDir = join(dirname(fileURLToPath(import.meta.url)), 'p1', 'analysis')
mkdirSync(outDir, { recursive: true })

// Minimal CSV writer (escapes quotes/commas/newlines per RFC 4180).
const cell = (v) => {
  const s = String(v ?? '')
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}
const toCsv = (rows, headers) =>
  [headers.join(','), ...rows.map((r) => headers.map((h) => cell(r[h])).join(','))].join('\n') + '\n'

const write = (name, rows, headers) => {
  writeFileSync(join(outDir, name), toCsv(rows, headers))
  console.log(`  ${name.padEnd(24)} ${rows.length} rows`)
}

// "Jan 23" -> "2023-01-01"
const MONTHS = { Jan:'01', Feb:'02', Mar:'03', Apr:'04', May:'05', Jun:'06',
                 Jul:'07', Aug:'08', Sep:'09', Oct:'10', Nov:'11', Dec:'12' }
const toIsoDate = (label) => {
  const [mon, yy] = label.split(' ')
  return `20${yy}-${MONTHS[mon]}-01`
}

console.log('Exporting Project 1 data ->', outDir)

write('salary_by_title.csv',
  salaryByTitle.map((r) => ({ title: r.title, median_salary: r.salary })),
  ['title', 'median_salary'])

write('top_countries.csv', topCountries, ['country', 'postings'])

write('remote_by_title.csv',
  remoteByTitle.map((r) => ({ title: r.title, remote_pct: r.pct })),
  ['title', 'remote_pct'])

write('top_skills.csv',
  topSkills.map((r) => ({ skill: r.skill, postings_count: r.count })),
  ['skill', 'postings_count'])

write('monthly_trend.csv',
  monthlyTrend.map((r) => ({
    date: toIsoDate(r.month), month_label: r.month, postings: r.postings, remote_pct: r.remote,
  })),
  ['date', 'month_label', 'postings', 'remote_pct'])

write('feature_importance.csv',
  mlResults.featureImportance.map((r) => ({
    feature: r.feature, importance: r.importance, direction: r.direction,
    direction_label: r.direction > 0 ? 'Higher pay' : 'Lower pay',
  })),
  ['feature', 'importance', 'direction', 'direction_label'])

write('ml_metrics.csv', [
  { metric: 'Accuracy',         value: mlResults.accuracy,  kind: 'score' },
  { metric: 'ROC-AUC',          value: mlResults.rocAuc,    kind: 'score' },
  { metric: 'Precision',        value: mlResults.precision, kind: 'score' },
  { metric: 'Recall',           value: mlResults.recall,    kind: 'score' },
  { metric: 'F1',               value: mlResults.f1,        kind: 'score' },
  { metric: 'Baseline',         value: mlResults.baseline,  kind: 'score' },
  { metric: 'Train Size',       value: mlResults.trainSize, kind: 'count' },
  { metric: 'Test Size',        value: mlResults.testSize,  kind: 'count' },
  { metric: 'Median Threshold', value: mlResults.threshold, kind: 'usd' },
], ['metric', 'value', 'kind'])

write('kpi_stats.csv', [
  { metric: 'Total Postings',    value_num: stats.totalPostings,    value_text: '1.6M' },
  { metric: 'Countries Covered', value_num: stats.countriesCovered, value_text: String(stats.countriesCovered) },
  { metric: 'Salary Records',    value_num: stats.salaryRecords,    value_text: '77K' },
  { metric: 'Median Salary',     value_num: stats.medianSalary,     value_text: '$110K' },
  { metric: 'Model Accuracy',    value_num: mlResults.accuracy,     value_text: '80%' },
  { metric: 'Top Role',          value_num: '',                     value_text: stats.topRole },
  { metric: 'Top Skill',         value_num: '',                     value_text: stats.topSkill },
  { metric: 'Date Range',        value_num: '',                     value_text: stats.dateRange },
], ['metric', 'value_num', 'value_text'])

console.log('Done.')
