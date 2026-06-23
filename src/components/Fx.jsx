import React, { useEffect, useRef } from 'react'

/**
 * Wraps text in the TextFX engine (loaded globally from index.html; absent in
 * tests → renders plain text, no-op).
 *
 *   <Fx mode="always" effect="[wave]">Hi</Fx>   runs continuously (hero)
 *   <Fx effect="[fire]">Shadow War</Fx>          0.3s eased "pop" on first
 *                                                scroll-in, then settles static
 *
 * mode — "reveal" (default): one-shot eased pop when first scrolled into view.
 *        "always": never stops. "hover": play while hovered. The engine owns
 *        the trigger, the gain envelope (easeInSine in / easeOutCubic out) and
 *        reduced-motion handling — this component just mounts it.
 *
 * Clean text is rendered as children so it shows before/without JS and never
 * leaks literal "[fire]…[/]" tags; the engine reads the markup from data-textfx.
 */
export default function Fx({ effect, mode = 'reveal', tag: Tag = 'span', className, children }) {
  const ref = useRef(null)
  const text = String(children ?? '')
  const src = `${effect}${text}[/]`

  useEffect(() => {
    const el = ref.current
    if (!el || !window.TextFX) return            // engine loads from index.html; absent in tests
    const inst = window.TextFX.mount(el, src)
    return () => { if (inst) inst.destroy(); el.__tfx = null }
  }, [src, mode])

  return (
    <Tag
      ref={ref}
      className={className ? `${className} textfx` : 'textfx'}
      data-textfx={src}
      data-tfx-mode={mode}
    >
      {children}
    </Tag>
  )
}
