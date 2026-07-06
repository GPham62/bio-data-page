import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import RoleSelectStrip from './RoleSelectStrip.jsx'
import { heroCards } from '../data/project1_roles.js'

describe('RoleSelectStrip', () => {
  it('renders one card per role with its name', () => {
    render(<RoleSelectStrip cards={heroCards} />)
    for (const c of heroCards) expect(screen.getByText(c.role)).toBeInTheDocument()
  })
  it('shows the short code on each card', () => {
    render(<RoleSelectStrip cards={heroCards} />)
    expect(screen.getByText('DA')).toBeInTheDocument()
    expect(screen.getByText('SE')).toBeInTheDocument()
  })
})
