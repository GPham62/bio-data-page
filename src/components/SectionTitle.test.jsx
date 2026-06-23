import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import SectionTitle from './SectionTitle.jsx'

describe('SectionTitle', () => {
  it('renders the index', () => {
    render(<SectionTitle index="01" title="Which roles pay the most?" />)
    expect(screen.getByText('01')).toBeInTheDocument()
  })

  it('renders the title as a level-2 heading', () => {
    render(<SectionTitle index="01" title="Which roles pay the most?" />)
    expect(
      screen.getByRole('heading', { level: 2, name: 'Which roles pay the most?' }),
    ).toBeInTheDocument()
  })

  it('renders the optional sub text when provided', () => {
    render(<SectionTitle index="01" title="Title" sub="Median salary by role" />)
    expect(screen.getByText('Median salary by role')).toBeInTheDocument()
  })

  it('omits the sub paragraph when sub is not provided', () => {
    render(<SectionTitle index="01" title="Title" />)
    expect(screen.queryByText('Median salary by role')).not.toBeInTheDocument()
  })

  it('leaves the index static by default (no TextFX markup)', () => {
    render(<SectionTitle index="01" title="Title" />)
    const idx = screen.getByText('01')
    expect(idx.className).not.toContain('textfx')
    expect(idx).not.toHaveAttribute('data-textfx')
  })

  it('adds TextFX fade markup to the index when fxIndex is set', () => {
    render(<SectionTitle index="02" title="Title" fxIndex />)
    const idx = screen.getByText('02')
    expect(idx.className).toContain('textfx')
    expect(idx.getAttribute('data-textfx')).toBe('[fade f=0.35 min=0.5]02[/]')
  })
})
