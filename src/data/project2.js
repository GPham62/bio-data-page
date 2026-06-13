// Cookie Cats A/B Testing — summary data
// Computed from cookie_cats.csv (90,189 players)
// A/B test: gate placement at level 30 vs level 40

export const stats = {
  totalPlayers: 90189,
  gate30Count: 44700,
  gate40Count: 45489,
  retention1_gate30: 44.82,
  retention1_gate40: 44.23,
  retention7_gate30: 19.02,
  retention7_gate40: 18.20,
  chi2_1day_pvalue: 0.0755,
  chi2_7day_pvalue: 0.0016,
  bootstrapMeanDiff: 0.83,
  bootstrapCILow: 0.34,
  bootstrapCIHigh: 1.28,
}

// Source dataset on Kaggle
export const kaggleUrl = 'https://www.kaggle.com/datasets/mursideyarkin/mobile-games-ab-testing-cookie-cats'
export const colabUrl  = 'https://colab.research.google.com/drive/15A4qz4yaRjBL-G__NavQPTf9eWeeAg9S'

export const groupSizes = [
  { group: 'Gate 30', count: 44700 },
  { group: 'Gate 40', count: 45489 },
]

export const retention1Data = [
  { group: 'Gate 30', rate: 44.82 },
  { group: 'Gate 40', rate: 44.23 },
]

export const retention7Data = [
  { group: 'Gate 30', rate: 19.02 },
  { group: 'Gate 40', rate: 18.20 },
]

export const bootstrapData = [
  { diff: -0.02, count: 2 },
  { diff: 0.02, count: 0 },
  { diff: 0.06, count: 0 },
  { diff: 0.10, count: 1 },
  { diff: 0.15, count: 1 },
  { diff: 0.19, count: 3 },
  { diff: 0.23, count: 5 },
  { diff: 0.27, count: 6 },
  { diff: 0.31, count: 5 },
  { diff: 0.35, count: 12 },
  { diff: 0.39, count: 16 },
  { diff: 0.43, count: 15 },
  { diff: 0.47, count: 22 },
  { diff: 0.51, count: 21 },
  { diff: 0.55, count: 41 },
  { diff: 0.59, count: 45 },
  { diff: 0.63, count: 45 },
  { diff: 0.67, count: 49 },
  { diff: 0.71, count: 50 },
  { diff: 0.75, count: 60 },
  { diff: 0.79, count: 77 },
  { diff: 0.83, count: 66 },
  { diff: 0.87, count: 62 },
  { diff: 0.91, count: 49 },
  { diff: 0.95, count: 64 },
  { diff: 0.99, count: 46 },
  { diff: 1.03, count: 49 },
  { diff: 1.07, count: 51 },
  { diff: 1.11, count: 38 },
  { diff: 1.15, count: 26 },
  { diff: 1.19, count: 16 },
  { diff: 1.23, count: 19 },
  { diff: 1.28, count: 14 },
  { diff: 1.32, count: 9 },
  { diff: 1.36, count: 7 },
  { diff: 1.40, count: 2 },
  { diff: 1.44, count: 2 },
  { diff: 1.48, count: 0 },
  { diff: 1.52, count: 2 },
  { diff: 1.56, count: 2 },
]

export const gameRoundsData = [
  { range: '0',       gate30: 1937,  gate40: 2057 },
  { range: '1-10',    gate30: 15736, gate40: 16259 },
  { range: '11-20',   gate30: 6811,  gate40: 7002 },
  { range: '21-50',   gate30: 9080,  gate40: 8495 },
  { range: '51-100',  gate30: 5041,  gate40: 5386 },
  { range: '101-500', gate30: 5668,  gate40: 5861 },
  { range: '500+',    gate30: 427,   gate40: 429 },
]
