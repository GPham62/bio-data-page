import React, { useEffect, useRef } from 'react'

/**
 * Wraps text in the TextFX engine (loaded globally from index.html; absent in
 * tests → renders plain text, no-op).
 *
 *   <Fx effect="[wave f=0.5]">Hello</Fx>     always-on ambient motion
 *   <Fx effect="[fire]" hover>Shadow War</Fx> mounts on hover, restores on leave
 *
 * effect — TextFX open tag(s), e.g. "[pulse]" or "[fade f=0.5 min=0.2]".
 * hover  — when set, the effect only runs while the element is hovered.
 */
export default function Fx({ effect, hover = false, tag: Tag = 'span', className, children }) {
  const ref = useRef(null)
  const text = String(children ?? '')
  const src = `${effect}${text}[/]`

  useEffect(() => {
    const el = ref.current
    if (!el || !window.TextFX) return

    if (!hover) {
      window.TextFX.mount(el)                       // reads data-textfx, rebuilds as per-char spans
      return () => window.TextFX.destroy(el)
    }

    const on = () => window.TextFX.mount(el, src)
    // ponytail: destroy() restores the tagged src as textContent — overwrite it
    // with the plain text so the literal "[fire]…[/]" never flashes on mouse-out.
    const off = () => { window.TextFX.destroy(el); el.textContent = text }
    el.addEventListener('mouseenter', on)
    el.addEventListener('mouseleave', off)
    return () => {
      window.TextFX.destroy(el)
      el.removeEventListener('mouseenter', on)
      el.removeEventListener('mouseleave', off)
    }
  }, [src, hover, text])

  // Always-on carries the engine markup (so it mounts and is inspectable);
  // hover stays plain text until the mouseenter handler mounts it.
  return (
    <Tag
      ref={ref}
      className={!hover ? (className ? `${className} textfx` : 'textfx') : className}
      data-textfx={hover ? undefined : src}
    >
      {children}
    </Tag>
  )
}
