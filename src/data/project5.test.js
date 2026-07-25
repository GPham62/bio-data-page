import { describe, it, expect } from 'vitest'
import {
  stats, ratingHistogram, byCategory, ratingPairs, complaints, districts,
} from './project5.js'

// These figures are published on the Project 5 page and all come from one run
// of project5_analysis.ipynb over one snapshot. The point of this suite is that
// the page can never quietly disagree with its own data: edit a headline number
// without editing the series behind it and these fail rather than the site
// shipping a wrong claim.

describe('project5 published figures', () => {
  it('the histogram sums to the analysable restaurant count', () => {
    const summed = ratingHistogram.reduce((acc, row) => acc + row.count, 0)
    expect(summed).toBe(stats.analysable)
  })

  it('the share at or above 4.5 matches the histogram', () => {
    const above = ratingHistogram
      .filter(row => row.rating >= 4.5)
      .reduce((acc, row) => acc + row.count, 0)
    expect(above / stats.analysable).toBeCloseTo(stats.shareAbove45, 2)
  })

  it('the quoted middle half is narrower than half a point', () => {
    expect(stats.ratingP75 - stats.ratingP25).toBeLessThan(0.5)
    expect(stats.ratingMedian).toBeGreaterThanOrEqual(stats.ratingP25)
    expect(stats.ratingMedian).toBeLessThanOrEqual(stats.ratingP75)
  })

  it('the price and rating spreads match byCategory', () => {
    const prices  = byCategory.map(row => row.medianPrice)
    const ratings = byCategory.map(row => row.medianRating)
    expect(Math.max(...prices) / Math.min(...prices)).toBeCloseTo(stats.priceSpread, 1)
    expect(Math.max(...ratings) - Math.min(...ratings)).toBeCloseTo(stats.ratingSpread, 2)
  })

  it('the scatter carries one point per paired restaurant', () => {
    expect(ratingPairs).toHaveLength(stats.pairedRestaurants)
    expect(stats.pairedRestaurants).toBeLessThanOrEqual(stats.reviewedRestaurants)
  })

  it('reports a correlation near zero, which is the whole finding', () => {
    expect(Math.abs(stats.correlation)).toBeLessThan(0.2)
  })

  it('every rating sits on the published scale', () => {
    ratingHistogram.forEach(row => {
      expect(row.rating).toBeGreaterThanOrEqual(0)
      expect(row.rating).toBeLessThanOrEqual(5)
    })
    ratingPairs.forEach(pair => {
      expect(pair.sf).toBeGreaterThan(0)
      expect(pair.sf).toBeLessThanOrEqual(5)
      expect(pair.foody).toBeGreaterThanOrEqual(0)
      expect(pair.foody).toBeLessThanOrEqual(10)
    })
  })

  it('no complaint category outnumbers the reviews it was labelled from', () => {
    complaints.forEach(row => {
      expect(row.n).toBeLessThanOrEqual(stats.reviews)
      expect(row.share).toBeCloseTo(row.n / stats.reviews, 2)
    })
  })

  it('withholds the drag figure for any category under 20 reviews', () => {
    complaints
      .filter(row => row.n < 20)
      .forEach(row => expect(row.drag).toBeNull())
  })

  it('the districts sum to the full restaurant count', () => {
    const summed = districts.reduce((acc, row) => acc + row.n, 0)
    expect(summed).toBe(stats.restaurants)
  })

  it('publishes a labelling accuracy the page can quote', () => {
    expect(stats.labelAccuracy).toBeGreaterThanOrEqual(0.8)
    expect(stats.labelAccuracy).toBeLessThanOrEqual(1)
  })
})
