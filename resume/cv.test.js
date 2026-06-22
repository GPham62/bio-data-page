import { describe, it, expect, beforeAll } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { JSDOM } from 'jsdom'

// resume/cv.html is a static, hand-authored CV (not a React component). These
// tests parse the raw HTML with jsdom and assert structural + content
// correctness so a careless edit (wrong lang, missing section, a metric typo,
// reordered sections) fails loudly before it ships.
//
// NOTE: vitest.config.js currently limits `include` to 'src/**/*.{test,spec}.{js,jsx}',
// so this file is NOT picked up by the default `npm test` run. To execute it,
// either add 'resume/**/*.test.js' to the include globs or run it directly:
//   npx vitest run resume/cv.test.js

const __dirname = dirname(fileURLToPath(import.meta.url))
const CV_HTML_PATH = join(__dirname, 'cv.html')

describe('resume/cv.html — structure & content', () => {
  let html
  let document

  beforeAll(() => {
    html = readFileSync(CV_HTML_PATH, 'utf-8')
    document = new JSDOM(html).window.document
  })

  describe('document metadata', () => {
    it('sets the document language to Vietnamese (<html lang="vi">)', () => {
      expect(document.documentElement.getAttribute('lang')).toBe('vi')
    })

    it('declares a UTF-8 charset (<meta charset="UTF-8">)', () => {
      const charsetMeta = document.querySelector('meta[charset]')
      expect(charsetMeta).not.toBeNull()
      expect(charsetMeta.getAttribute('charset').toUpperCase()).toBe('UTF-8')
    })

    it('links the external stylesheet cv.css', () => {
      const link = document.querySelector('link[rel="stylesheet"]')
      expect(link).not.toBeNull()
      expect(link.getAttribute('href')).toBe('cv.css')
    })
  })

  describe('header', () => {
    it('shows the candidate name "PHẠM TUẤN ANH" in the h1', () => {
      const h1 = document.querySelector('header h1')
      expect(h1).not.toBeNull()
      expect(h1.textContent).toContain('PHẠM TUẤN ANH')
    })

    it('shows the job title "Junior Data Analyst" in .title', () => {
      const title = document.querySelector('.title')
      expect(title).not.toBeNull()
      expect(title.textContent).toContain('Junior Data Analyst')
    })

    it('includes the contact email ptuananh196@gmail.com in the DOM text', () => {
      expect(document.body.textContent).toContain('ptuananh196@gmail.com')
    })

    it('includes the portfolio URL bio-ta.vercel.app in the DOM text', () => {
      expect(document.body.textContent).toContain('bio-ta.vercel.app')
    })
  })

  describe('section headings', () => {
    // The CV must contain all six logical sections. Heading casing in the file
    // is Title Case ("Tóm Tắt"), so we compare case-insensitively.
    const requiredHeadings = [
      'tóm tắt',
      'kỹ năng',
      'dự án',
      'kinh nghiệm',
      'học vấn',
      'chứng chỉ',
    ]

    let headingText

    beforeAll(() => {
      headingText = Array.from(document.querySelectorAll('h2'))
        .map((h2) => h2.textContent.toLowerCase())
        .join('\n')
    })

    it.each(requiredHeadings)('has a section heading containing "%s"', (needle) => {
      expect(headingText).toContain(needle)
    })

    it('has at least six <h2> section headings', () => {
      expect(document.querySelectorAll('h2').length).toBeGreaterThanOrEqual(6)
    })
  })

  describe('project metrics', () => {
    let bodyText

    beforeAll(() => {
      bodyText = document.body.textContent
    })

    it('mentions the 1.6 (million records) recruitment-analysis metric', () => {
      expect(bodyText).toContain('1.6')
    })

    it('mentions the Cookie Cats p-value 0.0016', () => {
      expect(bodyText).toContain('0.0016')
    })

    it('mentions the Cookie Cats user count (90,000 or 90.000)', () => {
      expect(bodyText.includes('90,000') || bodyText.includes('90.000')).toBe(true)
    })

    it('mentions the 80% ML accuracy metric', () => {
      expect(bodyText).toContain('80%')
    })
  })

  describe('certifications', () => {
    let bodyText
    let lowerBodyText

    beforeAll(() => {
      bodyText = document.body.textContent
      lowerBodyText = bodyText.toLowerCase()
    })

    it('describes the ML cert as "Supervised" learning', () => {
      expect(lowerBodyText).toContain('supervised')
    })

    it('does NOT claim "unsupervised" learning (the course only covers supervised)', () => {
      expect(lowerBodyText).not.toContain('unsupervised')
    })

    it('dates both certificates 04/2026', () => {
      const periods = Array.from(document.querySelectorAll('.period'))
        .map((el) => el.textContent.trim())
      const certPeriods = periods.filter((p) => p === '04/2026')
      expect(certPeriods.length).toBe(2)
    })
  })

  describe('section ordering', () => {
    it('places the Projects section before the Work Experience section in DOM order', () => {
      const firstProject = document.querySelector('.project')
      const firstJob = document.querySelector('.job')
      expect(firstProject).not.toBeNull()
      expect(firstJob).not.toBeNull()

      // Node.compareDocumentPosition: DOCUMENT_POSITION_FOLLOWING (4) means
      // firstJob comes AFTER firstProject in document order.
      const position = firstProject.compareDocumentPosition(firstJob)
      expect(position & 4).toBeTruthy()
    })
  })
})
