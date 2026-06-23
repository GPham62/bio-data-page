import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ChartTooltip from './ChartTooltip.jsx'

const payload = [{ name: 'Postings', value: 385000, color: '#00e5ff' }]

describe('ChartTooltip', () => {
  describe('visibility gating', () => {
    it('renders nothing when active is false', () => {
      const { container } = render(<ChartTooltip active={false} payload={payload} label="SQL" />)
      expect(container).toBeEmptyDOMElement()
    })

    it('renders nothing when active is true but payload is undefined', () => {
      const { container } = render(<ChartTooltip active={true} label="SQL" />)
      expect(container).toBeEmptyDOMElement()
    })

    it('renders nothing when payload is an empty array', () => {
      const { container } = render(<ChartTooltip active={true} payload={[]} label="SQL" />)
      expect(container).toBeEmptyDOMElement()
    })

    it('renders content when active is true and payload has entries', () => {
      render(<ChartTooltip active={true} payload={payload} label="SQL" />)
      expect(screen.getByText('SQL')).toBeInTheDocument()
    })
  })

  describe('value formatting', () => {
    it('formats a numeric value with thousands separators via toLocaleString', () => {
      render(<ChartTooltip active={true} payload={payload} label="SQL" />)
      expect(screen.getByText('385,000')).toBeInTheDocument()
    })

    it('renders a non-numeric value as-is without locale formatting', () => {
      render(
        <ChartTooltip
          active={true}
          payload={[{ name: 'Tier', value: 'Champions' }]}
          label="Segment"
        />,
      )
      expect(screen.getByText('Champions')).toBeInTheDocument()
    })

    it('applies the prefix immediately before the value', () => {
      render(<ChartTooltip active={true} payload={payload} label="SQL" prefix="$" />)
      // prefix + value share one <strong> node, so match the combined text.
      expect(screen.getByText('$385,000')).toBeInTheDocument()
    })

    it('applies the suffix immediately after the value', () => {
      render(
        <ChartTooltip active={true} payload={[{ name: 'Remote', value: 14 }]} label="Rate" suffix="%" />,
      )
      expect(screen.getByText('14%')).toBeInTheDocument()
    })

    it('renders the entry name alongside the value', () => {
      render(<ChartTooltip active={true} payload={payload} label="SQL" />)
      // Name is rendered as "Postings:" text node.
      expect(screen.getByText(/Postings/)).toBeInTheDocument()
    })
  })

  describe('multiple payload entries', () => {
    it('renders one line per payload entry (dual-axis charts)', () => {
      render(
        <ChartTooltip
          active={true}
          label="Jul 24"
          payload={[
            { name: 'Postings', value: 51152 },
            { name: 'Remote', value: 13.6 },
          ]}
        />,
      )
      expect(screen.getByText('51,152')).toBeInTheDocument()
      expect(screen.getByText('13.6')).toBeInTheDocument()
    })
  })

  describe('edge cases', () => {
    it('formats a zero value rather than treating it as missing', () => {
      render(<ChartTooltip active={true} payload={[{ name: 'Count', value: 0 }]} label="x" />)
      expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('renders the label text', () => {
      render(<ChartTooltip active={true} payload={payload} label="Some Label" />)
      expect(screen.getByText('Some Label')).toBeInTheDocument()
    })
  })
})
