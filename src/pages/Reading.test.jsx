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
