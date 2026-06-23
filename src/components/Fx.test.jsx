import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Fx from './Fx.jsx'

// window.TextFX is loaded from index.html at runtime and is absent in jsdom,
// so these assert the inert markup Fx renders before the engine mounts.
describe('Fx', () => {
  it('renders always-on text with engine markup', () => {
    render(<Fx effect="[wave f=0.5]">Hello</Fx>)
    const el = screen.getByText('Hello')
    expect(el.className).toContain('textfx')
    expect(el.getAttribute('data-textfx')).toBe('[wave f=0.5]Hello[/]')
  })

  it('merges a provided className alongside textfx', () => {
    render(<Fx effect="[pulse]" className="badge">LIVE</Fx>)
    const el = screen.getByText('LIVE')
    expect(el.className).toContain('badge')
    expect(el.className).toContain('textfx')
  })

  it('leaves hover effects as plain text until hovered (no engine markup)', () => {
    render(<Fx effect="[fire]" hover className="name">Shadow War</Fx>)
    const el = screen.getByText('Shadow War')
    expect(el.className).toBe('name')
    expect(el).not.toHaveAttribute('data-textfx')
  })
})
