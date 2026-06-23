import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import InsightBlock from './InsightBlock.jsx'

describe('InsightBlock', () => {
  it('renders the label', () => {
    render(<InsightBlock label="// insight" text="Plain text" />)
    expect(screen.getByText('// insight')).toBeInTheDocument()
  })

  it('renders plain text content', () => {
    render(<InsightBlock label="// insight" text="SQL appears in 385K postings" />)
    expect(screen.getByText('SQL appears in 385K postings')).toBeInTheDocument()
  })

  it('renders HTML markup from the text prop as real elements (dangerouslySetInnerHTML)', () => {
    const { container } = render(
      <InsightBlock label="// insight" text="SQL is the <strong>foundation</strong>" />,
    )
    const strong = container.querySelector('strong')
    expect(strong).not.toBeNull()
    expect(strong).toHaveTextContent('foundation')
  })

  it('applies the provided accent as a CSS custom property', () => {
    const { container } = render(
      <InsightBlock label="x" text="y" accent="#ff6b35" />,
    )
    expect(container.firstChild).toHaveStyle({ '--insight-accent': '#ff6b35' })
  })

  it('falls back to the global accent variable when no accent is given', () => {
    const { container } = render(<InsightBlock label="x" text="y" />)
    expect(container.firstChild).toHaveStyle({ '--insight-accent': 'var(--accent)' })
  })

  it('renders an empty paragraph when text is an empty string', () => {
    const { container } = render(<InsightBlock label="// insight" text="" />)
    const paragraph = container.querySelector('p')
    expect(paragraph).not.toBeNull()
    expect(paragraph).toBeEmptyDOMElement()
  })
})
