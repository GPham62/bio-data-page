import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import StatCard from './StatCard.jsx'

describe('StatCard', () => {
  it('renders the label and value', () => {
    render(<StatCard label="Total Postings" value="1.6M" />)
    expect(screen.getByText('Total Postings')).toBeInTheDocument()
    expect(screen.getByText('1.6M')).toBeInTheDocument()
  })

  it('renders the optional sub text when provided', () => {
    render(<StatCard label="Median Salary" value="$110k" sub="US market" />)
    expect(screen.getByText('US market')).toBeInTheDocument()
  })

  it('omits the sub element when sub is not provided', () => {
    render(<StatCard label="Median Salary" value="$110k" />)
    expect(screen.queryByText('US market')).not.toBeInTheDocument()
  })

  it('applies the provided accent color as a CSS custom property', () => {
    const { container } = render(<StatCard label="x" value="y" accent="#00cc96" />)
    expect(container.firstChild).toHaveStyle({ '--card-accent': '#00cc96' })
  })

  it('falls back to the global accent variable when no accent is given', () => {
    const { container } = render(<StatCard label="x" value="y" />)
    expect(container.firstChild).toHaveStyle({ '--card-accent': 'var(--accent)' })
  })

  it('applies the animation delay derived from the delay prop', () => {
    const { container } = render(<StatCard label="x" value="y" delay={0.4} />)
    expect(container.firstChild).toHaveStyle({ animationDelay: '0.4s' })
  })

  it('defaults the animation delay to 0s when delay is omitted', () => {
    const { container } = render(<StatCard label="x" value="y" />)
    expect(container.firstChild).toHaveStyle({ animationDelay: '0s' })
  })

  it('renders a numeric value of 0 rather than dropping it', () => {
    render(<StatCard label="Returns" value={0} />)
    expect(screen.getByText('0')).toBeInTheDocument()
  })
})
