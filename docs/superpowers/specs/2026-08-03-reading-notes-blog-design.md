# Reading notes blog — design

## Problem

The Home page "currently reading" widget only shows one hardcoded book title (bilingual, sourced from locale JSON) with no history and no way to capture what was actually learned from a finished book. The user wants:
1. Finished books shown alongside the current one, styled to match the site.
2. A place to write and later re-read notes/takeaways per book.

## Data model

New `src/data/bookNotes.js`, single source of truth for book title/author/status (titles are proper nouns, not translated — currently duplicated identically across `en.json`/`vi.json`, so moving them here removes dead duplication):

```js
export const books = [
  {
    slug: 'lean-analytics',
    title: 'Lean Analytics',
    author: 'Alistair Croll & Benjamin Yoskovitz',
    status: 'reading', // 'reading' | 'finished'
    started: '2026-08',
    finished: null,
    sections: [], // [{ heading, body }]
  },
  {
    slug: 'naked-statistics',
    title: 'Naked Statistics',
    author: 'Charles Wheelan',
    status: 'finished',
    started: null,
    finished: '2026-08',
    sections: [{ heading: '...', body: '...' }],
  },
]
```

`sections` content is English-only (personal notes, not recruiter-facing copy) — no VI translation required for book note bodies. UI chrome around the notes (labels, nav entry) stays bilingual, matching the rest of the site.

The `home.greeting.currently.reading` key is deleted from both locale files once `Home.jsx` reads the current book from `bookNotes.js` instead.

## Home page widget

`currentlyBlock` keeps its existing purple-left-border box style. Changes:
- "Currently reading" row pulls title/author from `bookNotes.js` (the entry with `status: 'reading'`) instead of the locale string.
- New row: finished books rendered as small pill chips reusing the existing pill-badge visual language (`badgeLive`/`badgeWip` styling pattern) — e.g. `✓ Naked Statistics`.
- A `→ Reading notes` link at the bottom of the box, navigating to the new Reading page's list view (`setActive('reading')`).

Clicking a finished-book chip also navigates to the Reading page's list view, not directly to that book's detail — no cross-page deep-linking parameter is added to `App.jsx`'s single `active` string. One extra click to reach a specific book's detail.

## Reading page

New page, `src/pages/Reading.jsx` + `Reading.module.css`. No router — matches the rest of the site's `useState`-based navigation. Internal state (`selectedSlug`) toggles between two views within the same page component:

- **List view**: one card per book from `bookNotes.js` (both `reading` and `finished`), each showing title, author, status badge, and finished date if applicable. Click → detail view.
- **Detail view**: renders the selected book's `sections` as heading/body blocks, visually consistent with the existing `pivotBox`/`thinkBox` pattern on Home. Back link returns to list view.

## Wiring

- `Sidebar.jsx`: `NAV` array gains `{ id: 'reading', key: 'reading' }`.
- `App.jsx`: gains `{active === 'reading' && <Reading setActive={setActive} />}`.
- `en.json` / `vi.json`: add `sidebar.nav.reading` key (both locales, per project i18n rule) and any Reading-page chrome labels (list/detail headings, "back" link, status labels). Delete `home.greeting.currently.reading` (superseded by `bookNotes.js`).

## Testing

One smoke test, `Reading.test.jsx`, following the existing `Home.test.jsx` pattern:
- List view renders a card per book in `bookNotes.js`.
- Clicking a card shows that book's sections.
- Clicking back returns to the list view.

## Out of scope (explicitly deferred, not silently dropped)

- Deep-linking directly to a single book's detail from Home (one extra click accepted instead).
- Markdown authoring/parsing for note bodies (plain JS data object — no new dependency).
- VI translations for note body content.
