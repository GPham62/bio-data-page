import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
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

  it('renders no tab buttons without the tabs prop', () => {
    render(<SqlCard title="t" code="c" href="#" linkLabel="l" />)
    expect(screen.queryByRole('button')).toBeNull()
  })
})

describe('SqlCard with tabs', () => {
  const tabs = [
    { label: 'SQL', title: 'roi.sql', code: 'SELECT 1', href: 'https://x/sql', linkLabel: 'View SQL' },
    { label: 'DAX', title: 'Skill Premium', code: 'RETURN 2', href: 'https://x/pbix', linkLabel: 'Download' },
  ]

  it('renders both tab buttons, first tab active by default', () => {
    render(<SqlCard tabs={tabs} />)
    expect(screen.getByRole('button', { name: 'SQL' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'DAX' })).toBeInTheDocument()
    expect(screen.getByText('roi.sql')).toBeInTheDocument()
    expect(screen.getByText('SELECT 1')).toBeInTheDocument()
    expect(screen.getByRole('link')).toHaveAttribute('href', 'https://x/sql')
  })

  it('clicking a tab swaps title, code and link', () => {
    render(<SqlCard tabs={tabs} />)
    fireEvent.click(screen.getByRole('button', { name: 'DAX' }))
    expect(screen.getByText('Skill Premium')).toBeInTheDocument()
    expect(screen.getByText('RETURN 2')).toBeInTheDocument()
    expect(screen.queryByText('SELECT 1')).toBeNull()
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', 'https://x/pbix')
    expect(link).toHaveTextContent('Download')
  })
})
