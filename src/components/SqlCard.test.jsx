import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import SqlCard from './SqlCard.jsx'

describe('SqlCard', () => {
  it('renders the title and the code block', () => {
    const { container } = render(
      <SqlCard title="Skills mart query" code="SELECT 1;" href="#" linkLabel="View on GitHub" />,
    )
    expect(screen.getByText('Skills mart query')).toBeInTheDocument()
    const pre = container.querySelector('pre')
    expect(pre).not.toBeNull()
    expect(pre).toHaveTextContent('SELECT 1;')
  })

  it('renders the repo link with safe external attributes', () => {
    render(<SqlCard title="t" code="c" href="https://github.com/x/y" linkLabel="View on GitHub" />)
    const link = screen.getByRole('link', { name: /View on GitHub/ })
    expect(link).toHaveAttribute('href', 'https://github.com/x/y')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('applies the provided accent as a CSS custom property', () => {
    const { container } = render(<SqlCard title="t" code="c" href="#" linkLabel="l" accent="#00cc96" />)
    expect(container.firstChild).toHaveStyle({ '--sql-accent': '#00cc96' })
  })

  it('falls back to the global accent variable when no accent is given', () => {
    const { container } = render(<SqlCard title="t" code="c" href="#" linkLabel="l" />)
    expect(container.firstChild).toHaveStyle({ '--sql-accent': 'var(--accent)' })
  })

  it('preserves code whitespace verbatim', () => {
    const code = 'SELECT a,\n       b\nFROM t;'
    const { container } = render(<SqlCard title="t" code={code} href="#" linkLabel="l" />)
    expect(container.querySelector('pre').textContent).toBe(code)
  })
})
