# Reading Notes Blog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the single hardcoded "currently reading" string on Home with a data-driven book list (current + finished), and add a "Reading" page where per-book notes/takeaways live for later re-reading.

**Architecture:** One new static data file (`src/data/bookNotes.js`) is the single source of truth for book title/author/status. A new `Reading` page reads it and toggles between a list view and a detail view via local `useState` — no router, matching the rest of the site's `useState`-based navigation in `App.jsx`. `Home.jsx` reads the same data file instead of a locale string.

**Tech Stack:** React 18, react-i18next, CSS Modules, Vitest + Testing Library. No new dependencies.

## Global Constraints

- Every user-facing string added or changed must be added to both `src/locales/en.json` and `src/locales/vi.json` in the same task (per project CLAUDE.md).
- Book note **body content** (the `sections` array in `bookNotes.js`) is English-only — not translated, per user decision during brainstorming.
- No new npm dependency (plain JS data object, no markdown parser).
- Follow existing CSS variable tokens (`--bg2`, `--border`, `--purple`, `--accent-blue`, `--green`, `--accent2`, `--muted`, `--mono`, `--head`, `--text`) — no new colors invented.
- After implementation, run the `portfolio-ux-auditor` agent on the changed pages (Home + Reading), both themes and both locales, per established project workflow.

---

### Task 1: Book data model + Reading page

**Files:**
- Create: `src/data/bookNotes.js`
- Create: `src/pages/Reading.jsx`
- Create: `src/pages/Reading.module.css`
- Create: `src/pages/Reading.test.jsx`
- Modify: `src/locales/en.json` (add top-level `reading` block)
- Modify: `src/locales/vi.json` (add top-level `reading` block)

**Interfaces:**
- Produces: `books` (named export, array) from `src/data/bookNotes.js`. Each entry: `{ slug: string, title: string, author: string, status: 'reading' | 'finished', started: string | null, finished: string | null, sections: Array<{ heading: string, body: string }> }`.
- Produces: `Reading` (default export, no props) from `src/pages/Reading.jsx` — consumed by Task 2's `App.jsx` wiring.
- Consumes: `en.reading.*` / `vi.reading.*` locale keys (`kicker`, `title`, `hint`, `by`, `back`, `status_reading`, `status_finished`, `empty_notes`).

- [ ] **Step 1: Create the data file**

```js
// src/data/bookNotes.js
export const books = [
  {
    slug: 'lean-analytics',
    title: 'Lean Analytics',
    author: 'Alistair Croll & Benjamin Yoskovitz',
    status: 'reading',
    started: '2026-08-03',
    finished: null,
    sections: [],
  },
  {
    slug: 'naked-statistics',
    title: 'Naked Statistics',
    author: 'Charles Wheelan',
    status: 'finished',
    started: null,
    finished: null,
    sections: [],
  },
]
```

- [ ] **Step 2: Add the `reading` locale block to both files**

In `src/locales/en.json`, add a new top-level key (sibling of `"home"`):

```json
  "reading": {
    "kicker": "// reading",
    "title": "Reading notes",
    "hint": "Books I've read or I'm reading, with what stuck.",
    "by": "by",
    "back": "← All books",
    "status_reading": "Reading",
    "status_finished": "Finished",
    "empty_notes": "Notes coming once I finish this one."
  },
```

In `src/locales/vi.json`, add the matching top-level key in the same position:

```json
  "reading": {
    "kicker": "// đọc sách",
    "title": "Ghi chú đọc sách",
    "hint": "Những cuốn sách tôi đã đọc hoặc đang đọc, cùng những điều tôi rút ra được.",
    "by": "của",
    "back": "← Tất cả sách",
    "status_reading": "Đang đọc",
    "status_finished": "Đã đọc",
    "empty_notes": "Ghi chú sẽ có khi tôi đọc xong cuốn này."
  },
```

- [ ] **Step 3: Write the failing test**

```jsx
// src/pages/Reading.test.jsx
import { describe, it, expect } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithI18n } from '../test/i18nTestUtils.jsx'
import Reading from './Reading.jsx'
import { books } from '../data/bookNotes.js'
import en from '../locales/en.json'

describe('Reading', () => {
  it('renders a card for every book in the list view', () => {
    renderWithI18n(<Reading />)
    books.forEach((book) => {
      expect(screen.getByText(book.title)).toBeInTheDocument()
    })
  })

  it('shows the book detail when a card is clicked', () => {
    renderWithI18n(<Reading />)
    const book = books[0]
    fireEvent.click(screen.getByText(book.title))
    expect(screen.getByRole('heading', { level: 1, name: book.title })).toBeInTheDocument()
    if (book.sections.length > 0) {
      expect(screen.getByText(book.sections[0].heading)).toBeInTheDocument()
    } else {
      expect(screen.getByText(en.reading.empty_notes)).toBeInTheDocument()
    }
  })

  it('returns to the list view when the back link is clicked', () => {
    renderWithI18n(<Reading />)
    fireEvent.click(screen.getByText(books[0].title))
    fireEvent.click(screen.getByText(en.reading.back))
    expect(screen.getByRole('heading', { level: 1, name: en.reading.title })).toBeInTheDocument()
  })
})
```

- [ ] **Step 4: Run the test to verify it fails**

Run: `npm test -- src/pages/Reading.test.jsx`
Expected: FAIL — `Reading.jsx` does not exist yet (module not found).

- [ ] **Step 5: Implement the Reading page**

```jsx
// src/pages/Reading.jsx
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { books } from '../data/bookNotes.js'
import styles from './Reading.module.css'

export default function Reading() {
  const { t } = useTranslation()
  const [selectedSlug, setSelectedSlug] = useState(null)
  const selectedBook = books.find((b) => b.slug === selectedSlug) || null

  if (selectedBook) {
    const isFinished = selectedBook.status === 'finished'
    return (
      <div className={styles.page}>
        <button type="button" className={styles.back} onClick={() => setSelectedSlug(null)}>
          {t('reading.back')}
        </button>
        <span className={styles.kicker}>{t('reading.kicker')}</span>
        <h1 className={styles.title}>{selectedBook.title}</h1>
        <p className={styles.byline}>{t('reading.by')} {selectedBook.author}</p>
        <span className={isFinished ? styles.statusFinished : styles.statusReading}>
          {isFinished ? t('reading.status_finished') : t('reading.status_reading')}
        </span>
        {selectedBook.sections.length > 0 ? (
          <div className={styles.sections}>
            {selectedBook.sections.map((section) => (
              <div key={section.heading} className={styles.sectionBlock}>
                <h2 className={styles.sectionHeading}>{section.heading}</h2>
                <p className={styles.sectionBody}>{section.body}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.empty}>{t('reading.empty_notes')}</p>
        )}
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <span className={styles.kicker}>{t('reading.kicker')}</span>
      <h1 className={styles.title}>{t('reading.title')}</h1>
      <p className={styles.hint}>{t('reading.hint')}</p>
      <div className={styles.list}>
        {books.map((book) => {
          const isFinished = book.status === 'finished'
          return (
            <button
              key={book.slug}
              type="button"
              className={styles.card}
              onClick={() => setSelectedSlug(book.slug)}
            >
              <span className={isFinished ? styles.statusFinished : styles.statusReading}>
                {isFinished ? t('reading.status_finished') : t('reading.status_reading')}
              </span>
              <span className={styles.cardTitle}>{book.title}</span>
              <span className={styles.cardAuthor}>{t('reading.by')} {book.author}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
```

```css
/* src/pages/Reading.module.css */
.page {
  max-width: 56.25rem;
  margin: 0 auto;
  padding: 4rem 2rem 6.25rem;
}

.kicker {
  display: block;
  font-family: var(--mono);
  font-size: 0.8125rem;
  color: var(--accent-blue);
  letter-spacing: 0.06em;
  margin-bottom: 1.125rem;
}

.title {
  font-family: var(--head);
  font-size: clamp(2rem, 5vw, 3.25rem);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: var(--text);
  margin: 0 0 0.625rem;
}

.hint {
  font-family: var(--mono);
  font-size: 0.75rem;
  color: var(--muted);
  margin: 0 0 2rem;
}

.list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
}

.card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
  text-align: left;
  background: var(--bg2);
  border: 0.0625rem solid var(--border);
  border-left: 0.125rem solid var(--purple);
  border-radius: 0.5rem;
  padding: 1.25rem 1.5rem;
  cursor: pointer;
  transition: border-color 0.2s, transform 0.2s;
}

.card:hover {
  border-color: var(--accent-blue);
  transform: translateY(-0.1875rem);
}

.cardTitle {
  font-family: var(--head);
  font-size: 1.0625rem;
  font-weight: 700;
  color: var(--text);
}

.cardAuthor {
  font-family: var(--mono);
  font-size: 0.75rem;
  color: var(--muted);
}

.statusReading,
.statusFinished {
  font-family: var(--mono);
  font-size: 0.625rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  border-radius: 6.25rem;
  padding: 0.1875rem 0.625rem;
}

.statusReading {
  color: var(--accent2);
  border: 0.0625rem solid rgba(255, 107, 53, 0.35);
}

.statusFinished {
  color: var(--green);
  border: 0.0625rem solid rgba(0, 204, 150, 0.4);
}

.back {
  display: inline-block;
  font-family: var(--mono);
  font-size: 0.75rem;
  letter-spacing: 0.06em;
  color: var(--accent-blue);
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  margin-bottom: 1.5rem;
}

.back:hover {
  text-decoration: underline;
}

.byline {
  font-family: var(--mono);
  font-size: 0.8125rem;
  color: var(--muted);
  margin: 0 0 0.875rem;
}

.sections {
  margin-top: 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.sectionBlock {
  background: var(--bg2);
  border: 0.0625rem solid var(--border);
  border-left: 0.125rem solid var(--purple);
  border-radius: 0.5rem;
  padding: 1.25rem 1.5rem;
}

.sectionHeading {
  font-family: var(--head);
  font-size: 1rem;
  font-weight: 700;
  color: var(--text);
  margin: 0 0 0.5rem;
}

.sectionBody {
  font-size: 0.9375rem;
  line-height: 1.8;
  color: var(--text);
  margin: 0;
}

.empty {
  font-family: var(--mono);
  font-size: 0.8125rem;
  color: var(--muted);
  margin-top: 1.75rem;
}

@media (max-width: 640px) {
  .list { grid-template-columns: 1fr; }
}

@media (max-width: 600px) {
  .page { padding: 2.5rem 1rem 4rem; }
}
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `npm test -- src/pages/Reading.test.jsx`
Expected: PASS (3 tests)

- [ ] **Step 7: Commit**

```bash
git add src/data/bookNotes.js src/pages/Reading.jsx src/pages/Reading.module.css src/pages/Reading.test.jsx src/locales/en.json src/locales/vi.json
git commit -m "feat(reading): add book data model and Reading page"
```

---

### Task 2: Wire the Reading page into navigation

**Files:**
- Modify: `src/components/Sidebar.jsx:5-8` (NAV array)
- Modify: `src/components/Sidebar.test.jsx`
- Modify: `src/App.jsx:9-10,26-31` (import + route branch)
- Modify: `src/locales/en.json` (add `sidebar.nav.reading`)
- Modify: `src/locales/vi.json` (add `sidebar.nav.reading`)

**Interfaces:**
- Consumes: `Reading` default export from `src/pages/Reading.jsx` (Task 1).
- Consumes: `sidebar.nav.reading` locale key.

- [ ] **Step 1: Write the failing test**

Add to the `describe('rendering', ...)` block in `src/components/Sidebar.test.jsx`, alongside the existing Home/Resume nav test:

```jsx
    it('renders a Reading nav button with a localized label', () => {
      renderWithI18n(<Sidebar active="home" setActive={() => {}} />)
      expect(screen.getByRole('button', { name: en.sidebar.nav.reading })).toBeInTheDocument()
    })
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/components/Sidebar.test.jsx`
Expected: FAIL — `en.sidebar.nav.reading` is `undefined`, so `getByRole` finds no button with that name.

- [ ] **Step 3: Add the locale key to both files**

In `src/locales/en.json`, inside `"sidebar": { "nav": { ... } }`:

```json
    "nav": {
      "home": "Home",
      "resume": "Resume",
      "reading": "Reading"
    },
```

In `src/locales/vi.json`, inside `"sidebar": { "nav": { ... } }`:

```json
    "nav": {
      "home": "Trang Chủ",
      "resume": "Hồ Sơ",
      "reading": "Đọc sách"
    },
```

- [ ] **Step 4: Add the nav entry in Sidebar.jsx**

In `src/components/Sidebar.jsx`, change:

```js
const NAV = [
  { id: 'home',   key: 'home' },
  { id: 'resume', key: 'resume' },
]
```

to:

```js
const NAV = [
  { id: 'home',    key: 'home' },
  { id: 'resume',  key: 'resume' },
  { id: 'reading', key: 'reading' },
]
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm test -- src/components/Sidebar.test.jsx`
Expected: PASS

- [ ] **Step 6: Wire the route in App.jsx**

In `src/App.jsx`, add the import alongside the other page imports:

```js
import Reading   from './pages/Reading.jsx'
```

Add the route branch alongside the other `active ===` checks:

```jsx
            {active === 'reading' && <Reading />}
```

- [ ] **Step 7: Manual check**

Run: `npm run dev`
Expected: clicking "Reading" in the sidebar shows the Reading page list view; clicking a card shows its detail; the back link returns to the list.

- [ ] **Step 8: Commit**

```bash
git add src/components/Sidebar.jsx src/components/Sidebar.test.jsx src/App.jsx src/locales/en.json src/locales/vi.json
git commit -m "feat(reading): add Reading nav entry and route"
```

---

### Task 3: Home widget reads from book data, adds finished chips + link

**Files:**
- Modify: `src/pages/Home.jsx:1-5,77-113`
- Modify: `src/pages/Home.module.css:44-82`
- Modify: `src/pages/Home.test.jsx:31-35`
- Modify: `src/locales/en.json` (add `home.greeting.currently.label_finished`, `.see_all`; delete `.reading`)
- Modify: `src/locales/vi.json` (same)

**Interfaces:**
- Consumes: `books` from `src/data/bookNotes.js` (Task 1).
- Consumes: `setActive` prop (already passed into `Home` by `App.jsx`) to navigate to `'reading'`.

- [ ] **Step 1: Write the failing test**

Replace the existing "Currently" test in `src/pages/Home.test.jsx` (around line 31) and add a new one. First add the import at the top of the file, alongside the other imports:

```js
import { books } from '../data/bookNotes.js'
```

Replace:

```jsx
    it('renders the "Currently" rows with their values', () => {
      renderWithI18n(<Home setActive={noop} />)
      expect(screen.getByText(en.home.greeting.currently.reading)).toBeInTheDocument()
      expect(screen.getByText(en.home.greeting.currently.building)).toBeInTheDocument()
    })
```

with:

```jsx
    it('renders the "Currently" rows with their values', () => {
      renderWithI18n(<Home setActive={noop} />)
      const currentBook = books.find((b) => b.status === 'reading')
      expect(screen.getByText(`${currentBook.title} — ${currentBook.author}`)).toBeInTheDocument()
      expect(screen.getByText(en.home.greeting.currently.building)).toBeInTheDocument()
    })

    it('renders a chip for each finished book and links to the Reading page', () => {
      const setActive = vi.fn()
      renderWithI18n(<Home setActive={setActive} />)
      const finishedBooks = books.filter((b) => b.status === 'finished')
      finishedBooks.forEach((book) => {
        expect(screen.getByText(`✓ ${book.title}`)).toBeInTheDocument()
      })
      fireEvent.click(screen.getByText(en.home.greeting.currently.see_all))
      expect(setActive).toHaveBeenCalledWith('reading')
    })
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/pages/Home.test.jsx`
Expected: FAIL — `currentBook.title` mismatches the old locale-driven text, and `en.home.greeting.currently.see_all` is `undefined`.

- [ ] **Step 3: Add/remove locale keys in both files**

In `src/locales/en.json`, change the `currently` block from:

```json
      "currently": {
        "label_reading": "Reading",
        "label_building": "Building",
        "reading": "Lean Analytics — Croll & Yoskovitz",
        "building": "Data portfolio + job hunt"
      }
```

to:

```json
      "currently": {
        "label_reading": "Reading",
        "label_building": "Building",
        "label_finished": "Finished",
        "building": "Data portfolio + job hunt",
        "see_all": "→ Reading notes"
      }
```

In `src/locales/vi.json`, change:

```json
      "currently": {
        "label_reading": "Đang đọc",
        "label_building": "Đang làm",
        "reading": "Lean Analytics — Croll & Yoskovitz",
        "building": "Portfolio dữ liệu + tìm việc"
      }
```

to:

```json
      "currently": {
        "label_reading": "Đang đọc",
        "label_building": "Đang làm",
        "label_finished": "Đã đọc",
        "building": "Portfolio dữ liệu + tìm việc",
        "see_all": "→ Ghi chú đọc sách"
      }
```

- [ ] **Step 4: Update Home.jsx**

Add the import at the top of `src/pages/Home.jsx`:

```js
import { books } from '../data/bookNotes.js'
```

Inside `export default function Home({ setActive }) {`, right after the `const { t, i18n } = useTranslation()` line, add:

```js
  const currentBook = books.find((b) => b.status === 'reading')
  const finishedBooks = books.filter((b) => b.status === 'finished')
```

Replace the `currentlyBlock` JSX (lines 102-113):

```jsx
          <div className={styles.currentlyBlock}>
            <div className={styles.currentlyRow}>
              <span className={styles.currentlyIcon}>📚</span>
              <span className={styles.currentlyLabel}>{t('home.greeting.currently.label_reading')}</span>
              <span className={styles.currentlyVal}>{t('home.greeting.currently.reading')}</span>
            </div>
            <div className={styles.currentlyRow}>
              <span className={styles.currentlyIcon}>🛠️</span>
              <span className={styles.currentlyLabel}>{t('home.greeting.currently.label_building')}</span>
              <span className={styles.currentlyVal}>{t('home.greeting.currently.building')}</span>
            </div>
          </div>
```

with:

```jsx
          <div className={styles.currentlyBlock}>
            <div className={styles.currentlyRow}>
              <span className={styles.currentlyIcon}>📚</span>
              <span className={styles.currentlyLabel}>{t('home.greeting.currently.label_reading')}</span>
              <span className={styles.currentlyVal}>{currentBook.title} — {currentBook.author}</span>
            </div>
            <div className={styles.currentlyRow}>
              <span className={styles.currentlyIcon}>🛠️</span>
              <span className={styles.currentlyLabel}>{t('home.greeting.currently.label_building')}</span>
              <span className={styles.currentlyVal}>{t('home.greeting.currently.building')}</span>
            </div>
            {finishedBooks.length > 0 && (
              <div className={styles.currentlyRow}>
                <span className={styles.currentlyIcon}>✅</span>
                <span className={styles.currentlyLabel}>{t('home.greeting.currently.label_finished')}</span>
                <span className={styles.finishedChips}>
                  {finishedBooks.map((book) => (
                    <button
                      key={book.slug}
                      type="button"
                      className={styles.finishedChip}
                      onClick={() => setActive('reading')}
                    >
                      ✓ {book.title}
                    </button>
                  ))}
                </span>
              </div>
            )}
            <button type="button" className={styles.currentlySeeAll} onClick={() => setActive('reading')}>
              {t('home.greeting.currently.see_all')}
            </button>
          </div>
```

- [ ] **Step 5: Add the new CSS classes to Home.module.css**

Insert after the existing `.currentlyVal` block (after line 82, before the `/* ── Character Sheet ── */` comment):

```css
.finishedChips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.finishedChip {
  font-family: var(--mono);
  font-size: 0.625rem;
  letter-spacing: 0.04em;
  color: var(--green);
  background: rgba(7, 9, 13, 0.65);
  border: 0.0625rem solid rgba(0, 204, 150, 0.4);
  border-radius: 6.25rem;
  padding: 0.1875rem 0.625rem;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}

.finishedChip:hover {
  border-color: var(--green);
  background: var(--bg3);
}

.currentlySeeAll {
  align-self: flex-start;
  font-family: var(--mono);
  font-size: 0.6875rem;
  color: var(--accent-blue);
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  letter-spacing: 0.06em;
  opacity: 0.85;
  transition: opacity 0.2s;
}

.currentlySeeAll:hover {
  opacity: 1;
  text-decoration: underline;
}
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `npm test -- src/pages/Home.test.jsx`
Expected: PASS (all tests, including the two touched/added in Step 1)

- [ ] **Step 7: Run the full test suite**

Run: `npm test`
Expected: PASS — confirms no other test (e.g. Sidebar, i18n sync checks) references the deleted `home.greeting.currently.reading` key.

- [ ] **Step 8: Commit**

```bash
git add src/pages/Home.jsx src/pages/Home.module.css src/pages/Home.test.jsx src/locales/en.json src/locales/vi.json
git commit -m "feat(home): source currently-reading from book data, add finished chips"
```

---

### Task 4: Visual verification

**Files:** none (no code changes — audit only)

- [ ] **Step 1: Run the dev server**

Run: `npm run dev`

- [ ] **Step 2: Dispatch the portfolio-ux-auditor agent**

Review the Home page's updated `currentlyBlock` and the new Reading page (list + detail views), in both dark/light theme and both EN/VI locale, per the project's established post-visual-change workflow. Fix anything it flags before considering the feature done.
