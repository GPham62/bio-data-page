import { describe, it, expect } from 'vitest'
import * as d from './project1_roles.js'

const ROLES = ['Data Analyst', 'Business Analyst', 'Data Engineer', 'Data Scientist', 'Software Engineer']

describe('project1_roles data module', () => {
  it('covers all 5 roles in every per-role table', () => {
    for (const table of [d.roleSalary, d.roleBarriers, d.roleLadder, d.vietnamPostings])
      expect(table.map(r => r.role)).toEqual(ROLES)
  })
  it('salary rows are ordered p25 <= median <= p75', () => {
    for (const r of d.roleSalary) {
      expect(r.p25).toBeLessThanOrEqual(r.median)
      expect(r.median).toBeLessThanOrEqual(r.p75)
    }
  })
  it('overlap matrix is 5x5 with unit diagonal', () => {
    expect(d.overlapMatrix).toHaveLength(25)
    d.overlapMatrix.filter(c => c.a === c.b).forEach(c => expect(c.j).toBe(1))
  })
  it('trend rows carry every role key', () => {
    for (const key of ROLES) expect(d.roleTrend[0]).toHaveProperty(key)
  })
  it('hero cards: 5 cards with color and badgeKey', () => {
    expect(d.heroCards).toHaveLength(5)
    d.heroCards.forEach(c => { expect(c.color).toMatch(/^#/); expect(c.badgeKey).toBeTruthy() })
  })
  it('verdict has 6 axes and known winners', () => {
    expect(d.verdictRows).toHaveLength(6)
    expect(d.verdictRows.map(v => v.axisKey)).toContain('entry')
  })
})
