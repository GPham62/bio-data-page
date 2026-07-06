import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import OverlapHeatmap from './OverlapHeatmap.jsx'
import { overlapMatrix } from '../data/project1_roles.js'

describe('OverlapHeatmap', () => {
  it('renders 25 value cells', () => {
    render(<OverlapHeatmap matrix={overlapMatrix} />)
    expect(screen.getAllByTestId('cell')).toHaveLength(25)
  })
  it('shows the DA-BA overlap value', () => {
    render(<OverlapHeatmap matrix={overlapMatrix} />)
    const daBa = overlapMatrix.find(c => c.a === 'DA' && c.b === 'BA')
    expect(screen.getAllByText(daBa.j.toFixed(2)).length).toBeGreaterThan(0)
  })
})
