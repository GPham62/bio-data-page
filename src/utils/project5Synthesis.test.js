import { describe, it, expect } from 'vitest'
import { pickMaxGapPair } from './project5Synthesis.js'

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
