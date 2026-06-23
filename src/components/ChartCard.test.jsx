import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ChartCard from './ChartCard.jsx'

describe('ChartCard', () => {
  it('renders the title', () => {
    render(<ChartCard title="Monthly Revenue">child</ChartCard>)
    expect(screen.getByText('Monthly Revenue')).toBeInTheDocument()
  })

  it('renders its children', () => {
    render(
      <ChartCard title="Monthly Revenue">
        <span>chart-body</span>
      </ChartCard>,
    )
    expect(screen.getByText('chart-body')).toBeInTheDocument()
  })

  it('renders the optional sub text when provided', () => {
    render(<ChartCard title="Revenue" sub="Dec 2010 – Dec 2011">x</ChartCard>)
    expect(screen.getByText('Dec 2010 – Dec 2011')).toBeInTheDocument()
  })

  it('omits the sub element when sub is not provided', () => {
    render(<ChartCard title="Revenue">x</ChartCard>)
    expect(screen.queryByText('Dec 2010 – Dec 2011')).not.toBeInTheDocument()
  })

  it('spans two grid columns when span is 2', () => {
    const { container } = render(<ChartCard title="Wide" span={2}>x</ChartCard>)
    expect(container.firstChild).toHaveStyle({ gridColumn: 'span 2' })
  })

  it('does not set an explicit gridColumn when span is the default of 1', () => {
    const { container } = render(<ChartCard title="Narrow">x</ChartCard>)
    // span !== 2 -> gridColumn is undefined, so no inline grid-column style.
    expect(container.firstChild.style.gridColumn).toBe('')
  })

  it('applies the animation delay from the delay prop', () => {
    const { container } = render(<ChartCard title="x" delay={0.6}>y</ChartCard>)
    expect(container.firstChild).toHaveStyle({ animationDelay: '0.6s' })
  })
})
