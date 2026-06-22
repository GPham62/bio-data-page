import { describe, it, expect } from 'vitest'
import en from './en.json'
import vi from './vi.json'

// Project convention (CLAUDE.md): en.json and vi.json must ALWAYS stay in sync.
// These tests fail loudly if one locale gains a key the other lacks, or if a
// translated array changes length (which would break index-based rendering).

/**
 * Walk an object and collect every leaf key path, e.g. "p1.recs_title".
 * Arrays are recorded as their path plus length so structural drift is caught.
 */
function collectKeyPaths(obj, prefix = '', acc = new Set()) {
  if (Array.isArray(obj)) {
    acc.add(`${prefix}[]:${obj.length}`)
    obj.forEach((item, i) => {
      if (item && typeof item === 'object') collectKeyPaths(item, `${prefix}[${i}]`, acc)
    })
    return acc
  }
  if (obj && typeof obj === 'object') {
    for (const key of Object.keys(obj)) {
      const path = prefix ? `${prefix}.${key}` : key
      const value = obj[key]
      if (value && typeof value === 'object') {
        collectKeyPaths(value, path, acc)
      } else {
        acc.add(path)
      }
    }
  }
  return acc
}

function diff(a, b) {
  return [...a].filter((x) => !b.has(x))
}

describe('locale parity (en.json <-> vi.json)', () => {
  const enKeys = collectKeyPaths(en)
  const viKeys = collectKeyPaths(vi)

  it('has no keys present in en but missing from vi', () => {
    expect(diff(enKeys, viKeys)).toEqual([])
  })

  it('has no keys present in vi but missing from en', () => {
    expect(diff(viKeys, enKeys)).toEqual([])
  })

  it('has an identical key structure in both locales', () => {
    expect([...enKeys].sort()).toEqual([...viKeys].sort())
  })

  describe('translated arrays keep the same length', () => {
    it('p1.recs_items has the same number of recommendations in both locales', () => {
      expect(en.p1.recs_items.length).toBe(vi.p1.recs_items.length)
    })

    it('p3.recs_items has the same number of recommendations in both locales', () => {
      expect(en.p3.recs_items.length).toBe(vi.p3.recs_items.length)
    })

    it('home.charSheet.skills has the same number of entries in both locales', () => {
      expect(en.home.charSheet.skills.length).toBe(vi.home.charSheet.skills.length)
    })
  })

  describe('shared non-translated values stay identical', () => {
    it('keeps the sidebar role string identical across locales', () => {
      // "Junior Data Analyst" is intentionally the same in both files.
      expect(en.sidebar.role).toBe(vi.sidebar.role)
    })
  })
})
