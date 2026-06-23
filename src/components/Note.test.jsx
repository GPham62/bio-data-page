import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import Note from './Note.jsx'

describe('Note', () => {
  it('renders the ℹ icon', () => {
    const { container } = render(<Note text="hello" />)
    expect(container).toHaveTextContent('ℹ')
  })

  it('renders HTML markup from the text prop as real elements (dangerouslySetInnerHTML)', () => {
    const { container } = render(<Note text="Gate 30 was <strong>significant</strong>" />)
    const strong = container.querySelector('strong')
    expect(strong).not.toBeNull()
    expect(strong).toHaveTextContent('significant')
  })

  it('applies the provided accent as a CSS custom property', () => {
    const { container } = render(<Note text="x" accent="#ff6b35" />)
    expect(container.firstChild).toHaveStyle({ '--note-accent': '#ff6b35' })
  })

  it('falls back to the global accent variable when no accent is given', () => {
    const { container } = render(<Note text="x" />)
    expect(container.firstChild).toHaveStyle({ '--note-accent': 'var(--accent)' })
  })
})
