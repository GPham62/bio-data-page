import { describe, it, expect } from 'vitest'
import { fmt, fmtUSD, pct } from './formatters'

describe('fmt', () => {
  describe('happy path', () => {
    it('returns millions with one decimal and an "M" suffix for values >= 1,000,000', () => {
      expect(fmt(1_615_930)).toBe('1.6M')
    })

    it('returns thousands rounded to a whole number with a "k" suffix for values in [1,000, 1,000,000)', () => {
      expect(fmt(385_000)).toBe('385k')
    })

    it('returns the raw number unchanged for values below 1,000', () => {
      expect(fmt(160)).toBe(160)
    })
  })

  describe('boundary values', () => {
    it('treats exactly 1,000,000 as millions', () => {
      expect(fmt(1_000_000)).toBe('1.0M')
    })

    it('treats exactly 1,000 as thousands', () => {
      expect(fmt(1_000)).toBe('1k')
    })

    it('treats 999,999 as thousands (just under the millions threshold)', () => {
      // 999999 / 1000 = 999.999 -> toFixed(0) rounds to "1000"
      expect(fmt(999_999)).toBe('1000k')
    })

    it('treats 999 as a raw value (just under the thousands threshold)', () => {
      expect(fmt(999)).toBe(999)
    })
  })

  describe('rounding behaviour', () => {
    it('rounds the millions value to a single decimal place', () => {
      // 1,234,567 / 1e6 = 1.234567 -> "1.2"
      expect(fmt(1_234_567)).toBe('1.2M')
    })

    it('rounds the thousands value to the nearest whole number', () => {
      // 1,500 / 1000 = 1.5 -> toFixed(0) rounds to "2"
      expect(fmt(1_500)).toBe('2k')
    })

    it('rounds 2,499 down to 2k', () => {
      expect(fmt(2_499)).toBe('2k')
    })
  })

  describe('edge cases', () => {
    it('returns 0 unchanged (falls through to the raw branch)', () => {
      expect(fmt(0)).toBe(0)
    })

    it('returns negative numbers unchanged because they never clear the thresholds', () => {
      expect(fmt(-5_000)).toBe(-5_000)
    })

    it('handles very large numbers', () => {
      expect(fmt(12_500_000)).toBe('12.5M')
    })
  })
})

describe('fmtUSD', () => {
  it('prefixes a dollar sign onto the formatted millions value', () => {
    expect(fmtUSD(1_615_930)).toBe('$1.6M')
  })

  it('prefixes a dollar sign onto the formatted thousands value', () => {
    expect(fmtUSD(110_000)).toBe('$110k')
  })

  it('prefixes a dollar sign onto a raw sub-thousand value', () => {
    expect(fmtUSD(500)).toBe('$500')
  })

  it('renders $0 for a zero amount', () => {
    expect(fmtUSD(0)).toBe('$0')
  })
})

describe('pct', () => {
  describe('happy path', () => {
    it('multiplies a fraction by 100 and appends a percent sign', () => {
      expect(pct(0.8)).toBe('80%')
    })

    it('rounds to the nearest whole percent', () => {
      // 0.825 * 100 = 82.5 -> toFixed(0) rounds to "83"
      expect(pct(0.825)).toBe('83%')
    })
  })

  describe('edge cases', () => {
    it('returns 0% for zero', () => {
      expect(pct(0)).toBe('0%')
    })

    it('returns 100% for a value of 1', () => {
      expect(pct(1)).toBe('100%')
    })

    it('handles values above 1 (over 100%)', () => {
      expect(pct(1.5)).toBe('150%')
    })

    it('rounds a tiny fraction down to 0%', () => {
      expect(pct(0.004)).toBe('0%')
    })

    it('handles negative fractions', () => {
      expect(pct(-0.25)).toBe('-25%')
    })
  })
})
