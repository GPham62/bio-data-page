import { describe, it, expect, vi } from 'vitest'
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

  it('shows finished-book empty-state copy for a finished book with no notes yet', () => {
    renderWithI18n(<Reading />)
    const finishedBook = books.find((b) => b.status === 'finished' && b.sections.length === 0)
    fireEvent.click(screen.getByText(finishedBook.title))
    expect(screen.getByText(en.reading.empty_notes_finished)).toBeInTheDocument()
  })

  it('calls setActive with home when the back-to-home nav is clicked', () => {
    const setActive = vi.fn()
    renderWithI18n(<Reading setActive={setActive} />)
    fireEvent.click(screen.getByText(en.nav.home))
    expect(setActive).toHaveBeenCalledWith('home')
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

  it('opens directly to the book matching initialSlug', () => {
    const book = books[1]
    renderWithI18n(<Reading initialSlug={book.slug} />)
    expect(screen.getByRole('heading', { level: 1, name: book.title })).toBeInTheDocument()
  })

  it('shows a count of how many books are listed', () => {
    renderWithI18n(<Reading />)
    expect(screen.getByText(en.reading.count.replace('{{count}}', books.length))).toBeInTheDocument()
  })
})
