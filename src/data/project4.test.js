import { describe, it, expect } from 'vitest'
import { stats, schemaSizes, sourceTables, marts } from './project4.js'

// These numbers are published on the Project 4 page and are countable from
// sql/project1/. The point of this suite is that the page can never quietly
// disagree with its own data module: if someone edits one figure, the
// cross-checks below fail rather than the site shipping a wrong claim.

describe('project4 published figures', () => {
  it('table count equals the sum of tables per schema', () => {
    const summed = schemaSizes.reduce((acc, row) => acc + row.tables, 0)
    expect(summed).toBe(stats.tables)
  })

  it('claims 18 tables across 5 schemas, matching sql/project1/', () => {
    expect(stats.tables).toBe(18)
    expect(stats.schemas).toBe(5)
    expect(schemaSizes).toHaveLength(stats.schemas)
  })

  it('source CSV count matches the number of source tables loaded', () => {
    expect(sourceTables).toHaveLength(stats.sourceCsvs)
    const source = schemaSizes.find(row => row.kind === 'source')
    expect(source.tables).toBe(stats.sourceCsvs)
  })

  it('mart count matches the number of mart schemas', () => {
    expect(marts).toHaveLength(stats.marts)
    expect(schemaSizes.filter(row => row.kind === 'mart')).toHaveLength(stats.marts)
  })

  it('each mart schema appears in schemaSizes with the same table count', () => {
    marts.forEach(mart => {
      const row = schemaSizes.find(s => s.schema === mart.schema)
      expect(row, `${mart.schema} missing from schemaSizes`).toBeDefined()
      expect(row.tables).toBe(mart.tables.length)
    })
  })

  it('exactly one mart is incremental', () => {
    // The page says so in plain words. If a second mart ever gains a MERGE,
    // this fails and the copy has to be updated with it.
    const incremental = marts.filter(m => m.refresh === 'incremental')
    expect(incremental).toHaveLength(1)
    expect(incremental[0].schema).toBe('priority_mart')
  })

  it('every mart declares a known refresh strategy', () => {
    marts.forEach(mart => {
      expect(['incremental', 'rebuild']).toContain(mart.refresh)
    })
  })
})
