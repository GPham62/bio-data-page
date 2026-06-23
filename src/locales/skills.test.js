import { describe, it, expect } from 'vitest'
import en from './en.json'
import vi from './vi.json'

const EXPECTED_ICONS = [
  '/skill-icons/sql.png',
  '/skill-icons/python.png',
  '/skill-icons/powerbi.png',
  '/skill-icons/excel.png',
  '/skill-icons/unity.png',
  '/skill-icons/ai.png',
]

describe('charSheet skills data', () => {
  for (const [name, loc] of [['en', en], ['vi', vi]]) {
    const skills = loc.home.charSheet.skills

    it(`${name}: has 6 skills, each with name/level/icon and no pct`, () => {
      expect(skills).toHaveLength(6)
      skills.forEach((s) => {
        expect(typeof s.name).toBe('string')
        expect(typeof s.level).toBe('string')
        expect(s.icon).toMatch(/^\/skill-icons\/.+\.png$/)
        expect(s).not.toHaveProperty('pct')
      })
    })

    it(`${name}: icons are in the expected order`, () => {
      expect(skills.map((s) => s.icon)).toEqual(EXPECTED_ICONS)
    })
  }

  it('marks exactly one skill (Unity/C#) as former', () => {
    const former = en.home.charSheet.skills.filter((s) => s.former)
    expect(former).toHaveLength(1)
    expect(former[0].name).toBe('Unity/C#')
  })

  it('adds the AI-Assisted Analysis skill in both locales', () => {
    expect(en.home.charSheet.skills.at(-1)).toMatchObject({
      name: 'AI-Assisted Analysis', level: 'Everyday', icon: '/skill-icons/ai.png',
    })
    expect(vi.home.charSheet.skills.at(-1)).toMatchObject({
      name: 'AI-Assisted Analysis', level: 'Dùng hằng ngày', icon: '/skill-icons/ai.png',
    })
  })
})
