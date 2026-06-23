import { describe, it, expect } from 'vitest'
import { screen, within } from '@testing-library/react'
import { renderWithI18n } from '../test/i18nTestUtils.jsx'
import CohortHeatmap from './CohortHeatmap.jsx'
import en from '../locales/en.json'
import vi from '../locales/vi.json'

// Minimal, well-understood fixtures so assertions are easy to reason about.
const twoCol = [
  { cohort: 'Dec 10', m0: 100, m1: 36 },
  { cohort: 'Jan 11', m0: 100, m1: 24 },
]

// A ragged matrix mirrors the real cohortData: later rows have fewer months.
// Column count is derived from the FIRST row only.
const ragged = [
  { cohort: 'Dec 10', m0: 100, m1: 36, m2: 32 },
  { cohort: 'Jan 11', m0: 100, m1: 24 }, // missing m2 -> renders blank
]

describe('CohortHeatmap', () => {
  describe('rendering', () => {
    it('renders the localized heatmap title from the p3 namespace', () => {
      renderWithI18n(<CohortHeatmap data={twoCol} />)
      expect(screen.getByText(en.p3.chart_cohort)).toBeInTheDocument()
    })

    it('renders the localized cohort column label', () => {
      renderWithI18n(<CohortHeatmap data={twoCol} />)
      expect(screen.getByText(en.p3.cohort_label)).toBeInTheDocument()
    })

    it('renders one month header for each non-cohort key in the first row', () => {
      renderWithI18n(<CohortHeatmap data={twoCol} />)
      // twoCol[0] has m0 and m1 -> exactly M0 and M1 headers, no M2.
      expect(screen.getByText('M0')).toBeInTheDocument()
      expect(screen.getByText('M1')).toBeInTheDocument()
      expect(screen.queryByText('M2')).not.toBeInTheDocument()
    })

    it('renders each cohort row label', () => {
      renderWithI18n(<CohortHeatmap data={twoCol} />)
      expect(screen.getByText('Dec 10')).toBeInTheDocument()
      expect(screen.getByText('Jan 11')).toBeInTheDocument()
    })

    it('renders cell values with a percent sign', () => {
      renderWithI18n(<CohortHeatmap data={twoCol} />)
      // m0 = 100 for both rows
      expect(screen.getAllByText('100%')).toHaveLength(2)
      expect(screen.getByText('36%')).toBeInTheDocument()
      expect(screen.getByText('24%')).toBeInTheDocument()
    })
  })

  describe('ragged data (missing month values)', () => {
    it('derives the column count from the first row, not the longest row', () => {
      renderWithI18n(<CohortHeatmap data={ragged} />)
      // First row has m0, m1, m2 -> three headers.
      expect(screen.getByText('M2')).toBeInTheDocument()
      expect(screen.queryByText('M3')).not.toBeInTheDocument()
    })

    it('renders a blank cell (no percent) where a later row lacks that month', () => {
      renderWithI18n(<CohortHeatmap data={ragged} />)
      // ragged[1] has no m2 -> only the first row's "32%" exists for m2.
      expect(screen.getByText('32%')).toBeInTheDocument()
      // 32% appears exactly once because the second row's m2 is undefined.
      expect(screen.getAllByText('32%')).toHaveLength(1)
    })
  })

  describe('edge cases', () => {
    it('renders zero month columns when given an empty data array', () => {
      renderWithI18n(<CohortHeatmap data={[]} />)
      // Title still renders, but no month headers.
      expect(screen.getByText(en.p3.chart_cohort)).toBeInTheDocument()
      expect(screen.queryByText('M0')).not.toBeInTheDocument()
    })

    it('renders a zero value as "0%" rather than treating it as blank', () => {
      renderWithI18n(<CohortHeatmap data={[{ cohort: 'Zero', m0: 0 }]} />)
      expect(screen.getByText('0%')).toBeInTheDocument()
    })
  })

  describe('i18n', () => {
    it('renders Vietnamese strings when the instance language is "vi"', () => {
      renderWithI18n(<CohortHeatmap data={twoCol} />, { lng: 'vi' })
      expect(screen.getByText(vi.p3.chart_cohort)).toBeInTheDocument()
      expect(screen.getByText(vi.p3.cohort_label)).toBeInTheDocument()
    })
  })
})
