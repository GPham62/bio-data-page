// E-Commerce Customer Segmentation — summary data
// Based on UCI Online Retail II dataset analysis
// RFM segmentation, cohort analysis, revenue trends

export const stats = {
  totalTransactions: 541909,
  uniqueCustomers: 4372,
  totalRevenue: 8911407,
  avgOrderValue: 19.86,
  returnRate: 2.2,
  topCountry: 'United Kingdom',
}

// Source dataset on Kaggle (verify/replace if you used a different mirror)
export const kaggleUrl = 'https://www.kaggle.com/datasets/carrie1/ecommerce-data'

export const monthlyRevenue = [
  { month: 'Dec 10', revenue: 748957 },
  { month: 'Jan 11', revenue: 560000 },
  { month: 'Feb 11', revenue: 498063 },
  { month: 'Mar 11', revenue: 683267 },
  { month: 'Apr 11', revenue: 493208 },
  { month: 'May 11', revenue: 723333 },
  { month: 'Jun 11', revenue: 691123 },
  { month: 'Jul 11', revenue: 681300 },
  { month: 'Aug 11', revenue: 682881 },
  { month: 'Sep 11', revenue: 1019688 },
  { month: 'Oct 11', revenue: 1070704 },
  { month: 'Nov 11', revenue: 1461756 },
  { month: 'Dec 11', revenue: 596928 },
]

export const topCountries = [
  { country: 'United Kingdom', revenue: 7308392 },
  { country: 'Netherlands',    revenue: 284662 },
  { country: 'EIRE',           revenue: 265546 },
  { country: 'Germany',        revenue: 228867 },
  { country: 'France',         revenue: 209148 },
  { country: 'Australia',      revenue: 137077 },
  { country: 'Spain',          revenue:  61215 },
  { country: 'Switzerland',    revenue:  56385 },
  { country: 'Belgium',        revenue:  41034 },
  { country: 'Sweden',         revenue:  36596 },
]

export const rfmSegments = [
  { segment: 'Champions',       count: 632,  avgRevenue: 6820, color: '#00cc96' },
  { segment: 'Loyal',           count: 819,  avgRevenue: 2890, color: '#00e5ff' },
  { segment: 'Potential Loyal', count: 486,  avgRevenue: 1340, color: '#a371f7' },
  { segment: 'At Risk',         count: 593,  avgRevenue: 1780, color: '#ff6b35' },
  { segment: 'Hibernating',     count: 1040, avgRevenue: 490,  color: '#636e7b' },
  { segment: 'Lost',            count: 802,  avgRevenue: 310,  color: '#ef553b' },
]

export const rfmScatter = [
  { recency: 5, frequency: 45, monetary: 12400, segment: 'Champions' },
  { recency: 12, frequency: 38, monetary: 9800, segment: 'Champions' },
  { recency: 8, frequency: 42, monetary: 11200, segment: 'Champions' },
  { recency: 3, frequency: 50, monetary: 15600, segment: 'Champions' },
  { recency: 15, frequency: 35, monetary: 8900, segment: 'Champions' },
  { recency: 20, frequency: 28, monetary: 5100, segment: 'Loyal' },
  { recency: 25, frequency: 22, monetary: 4200, segment: 'Loyal' },
  { recency: 18, frequency: 30, monetary: 5800, segment: 'Loyal' },
  { recency: 30, frequency: 25, monetary: 4500, segment: 'Loyal' },
  { recency: 22, frequency: 20, monetary: 3800, segment: 'Loyal' },
  { recency: 35, frequency: 15, monetary: 2100, segment: 'Potential Loyal' },
  { recency: 40, frequency: 12, monetary: 1800, segment: 'Potential Loyal' },
  { recency: 28, frequency: 18, monetary: 2500, segment: 'Potential Loyal' },
  { recency: 45, frequency: 10, monetary: 1500, segment: 'Potential Loyal' },
  { recency: 90, frequency: 20, monetary: 3200, segment: 'At Risk' },
  { recency: 120, frequency: 15, monetary: 2400, segment: 'At Risk' },
  { recency: 100, frequency: 18, monetary: 2800, segment: 'At Risk' },
  { recency: 110, frequency: 12, monetary: 1900, segment: 'At Risk' },
  { recency: 150, frequency: 5, monetary: 800, segment: 'Hibernating' },
  { recency: 180, frequency: 3, monetary: 450, segment: 'Hibernating' },
  { recency: 200, frequency: 4, monetary: 600, segment: 'Hibernating' },
  { recency: 170, frequency: 2, monetary: 320, segment: 'Hibernating' },
  { recency: 250, frequency: 2, monetary: 280, segment: 'Lost' },
  { recency: 300, frequency: 1, monetary: 150, segment: 'Lost' },
  { recency: 280, frequency: 1, monetary: 200, segment: 'Lost' },
  { recency: 320, frequency: 1, monetary: 120, segment: 'Lost' },
]

export const cohortData = [
  { cohort: 'Dec 10', m0: 100, m1: 36, m2: 32, m3: 37, m4: 30, m5: 36, m6: 33, m7: 35, m8: 38, m9: 36, m10: 37, m11: 41, m12: 26 },
  { cohort: 'Jan 11', m0: 100, m1: 24, m2: 21, m3: 29, m4: 24, m5: 22, m6: 27, m7: 29, m8: 24, m9: 28, m10: 32, m11: 14 },
  { cohort: 'Feb 11', m0: 100, m1: 21, m2: 26, m3: 18, m4: 19, m5: 24, m6: 23, m7: 19, m8: 24, m9: 26, m10: 12 },
  { cohort: 'Mar 11', m0: 100, m1: 28, m2: 22, m3: 23, m4: 28, m5: 27, m6: 22, m7: 25, m8: 30, m9: 10 },
  { cohort: 'Apr 11', m0: 100, m1: 19, m2: 17, m3: 22, m4: 20, m5: 15, m6: 18, m7: 25, m8: 9 },
  { cohort: 'May 11', m0: 100, m1: 20, m2: 22, m3: 18, m4: 14, m5: 19, m6: 23, m7: 8 },
  { cohort: 'Jun 11', m0: 100, m1: 18, m2: 15, m3: 12, m4: 17, m5: 22, m6: 7 },
  { cohort: 'Jul 11', m0: 100, m1: 16, m2: 13, m3: 18, m4: 22, m5: 6 },
  { cohort: 'Aug 11', m0: 100, m1: 17, m2: 19, m3: 21, m4: 8 },
  { cohort: 'Sep 11', m0: 100, m1: 25, m2: 27, m3: 11 },
  { cohort: 'Oct 11', m0: 100, m1: 22, m2: 10 },
  { cohort: 'Nov 11', m0: 100, m1: 12 },
  { cohort: 'Dec 11', m0: 100 },
]
