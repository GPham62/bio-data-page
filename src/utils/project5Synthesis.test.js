import { describe, it, expect } from 'vitest'
import { pickMaxGapPair, pickTopByShare, pickTopByDrag } from './project5Synthesis.js'

describe('pickMaxGapPair', () => {
  it('picks the pair with the largest normalized gap', () => {
    const pairs = [
      { sf: 4.5, foody: 9.0, n: 3 },   // normalized sf 9.0, gap 0
      { sf: 4.8, foody: 1.0, n: 1 },   // normalized sf 9.6, gap 8.6 <- largest
      { sf: 4.0, foody: 7.0, n: 5 },   // normalized sf 8.0, gap 1.0
    ]
    expect(pickMaxGapPair(pairs)).toEqual({ sf: 4.8, foody: 1.0 })
  })

  it('returns null for an empty list', () => {
    expect(pickMaxGapPair([])).toBeNull()
  })

  it('breaks ties by keeping the first pair encountered', () => {
    const pairs = [
      { sf: 4.5, foody: 0.9, n: 1 },
      { sf: 5.0, foody: 1.9, n: 1 }, // same gap (8.1) as the row above
    ]
    expect(pickMaxGapPair(pairs)).toEqual({ sf: 4.5, foody: 0.9 })
  })
})

describe('pickTopByShare', () => {
  it('picks the category with the highest share', () => {
    const complaints = [
      { category: 'taste', n: 229, share: 0.331, drag: 2.035 },
      { category: 'value', n: 114, share: 0.165, drag: 1.622 },
    ]
    expect(pickTopByShare(complaints)).toEqual({ category: 'taste', n: 229, share: 0.331 })
  })
})

describe('pickTopByDrag', () => {
  it('picks the category with the highest drag, ignoring nulls', () => {
    const complaints = [
      { category: 'wait', n: 37, share: 0.054, drag: 0.986 },
      { category: 'cleanliness', n: 31, share: 0.045, drag: 2.94 },
      { category: 'thin', n: 5, share: 0.01, drag: null },
    ]
    expect(pickTopByDrag(complaints)).toEqual({ category: 'cleanliness', drag: 2.94 })
  })

  it('returns null if every category lacks a drag figure', () => {
    const complaints = [{ category: 'thin', n: 5, share: 0.01, drag: null }]
    expect(pickTopByDrag(complaints)).toBeNull()
  })
})
