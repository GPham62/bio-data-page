import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Fx from './Fx.jsx'

// window.TextFX is loaded from index.html at runtime and is absent in jsdom,
// so these assert the inert markup Fx renders before the engine mounts.
describe('Fx', () => {
  it('renders clean text with the effect in data-textfx and the mode attribute', () => {
    render(<Fx mode="always" effect="[wave f=0.5]">Hello</Fx>)
    const el = screen.getByText('Hello')
    expect(el.className).toContain('textfx')
    expect(el.getAttribute('data-textfx')).toBe('[wave f=0.5]Hello[/]')
    expect(el.getAttribute('data-tfx-mode')).toBe('always')
    expect(el.textContent).not.toMatch(/[[\]]/)   // tags live in the attribute, not visible
  })

  it('defaults to reveal mode and merges a provided className', () => {
    render(<Fx effect="[fire]" className="name">Shadow War</Fx>)
    const el = screen.getByText('Shadow War')
    expect(el.getAttribute('data-tfx-mode')).toBe('reveal')
    expect(el.className).toContain('name')
    expect(el.className).toContain('textfx')
  })

  it('passes the pop envelope through to data-tfx-pop, omitting it when unset', () => {
    const { rerender } = render(<Fx effect="[fire]" pop="130,400,450">Shadow War</Fx>)
    expect(screen.getByText('Shadow War').getAttribute('data-tfx-pop')).toBe('130,400,450')
    rerender(<Fx effect="[wave]">Plain</Fx>)
    expect(screen.getByText('Plain')).not.toHaveAttribute('data-tfx-pop')
  })
})
