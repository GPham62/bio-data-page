import React from 'react'
import { useTranslation } from 'react-i18next'
import styles from './CohortHeatmap.module.css'

const MONTHS = ['M0','M1','M2','M3','M4','M5','M6','M7','M8','M9','M10','M11','M12']

function getColor(val) {
  if (val === undefined || val === null) return 'transparent'
  if (val >= 100) return 'rgba(0,204,150,0.5)'
  if (val >= 30)  return 'rgba(0,204,150,0.35)'
  if (val >= 20)  return 'rgba(0,204,150,0.22)'
  if (val >= 10)  return 'rgba(0,229,255,0.18)'
  return 'rgba(99,110,123,0.15)'
}

export default function CohortHeatmap({ data }) {
  const { t } = useTranslation()
  const cols = data[0] ? Object.keys(data[0]).filter(k => k !== 'cohort').length : 0

  return (
    <div className={styles.heatmapWrap}>
      <div className={styles.heatmapTitle}>{t('p3.chart_cohort')}</div>
      <div className={styles.heatmapSub}>{t('p3.chart_cohort_sub')}</div>
      <div className={styles.heatmap} style={{ gridTemplateColumns: `100px repeat(${cols}, 1fr)` }}>
        <div className={styles.heatmapHeader}>
          <div className={styles.heatmapHeaderCell}>{t('p3.cohort_label')}</div>
          {MONTHS.slice(0, cols).map(m => (
            <div key={m} className={styles.heatmapHeaderCell}>{m}</div>
          ))}
        </div>
        {data.map(row => (
          <div key={row.cohort} className={styles.heatmapRow}>
            <div className={styles.heatmapLabel}>{row.cohort}</div>
            {MONTHS.slice(0, cols).map(m => {
              const val = row[m.toLowerCase()]
              return (
                <div key={m} className={styles.heatmapCell} style={{ background: getColor(val) }}>
                  {val !== undefined ? `${val}%` : ''}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
