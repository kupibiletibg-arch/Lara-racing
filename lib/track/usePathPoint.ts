'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Returns the SVG point at a given fraction (0..1) along the path.
 * `ref` must point to an <svg><path/></svg>'s path element.
 *
 * Uses SVGPathElement.getPointAtLength which is available in every browser.
 * Totally length is measured once per mount (path is static per track).
 */
export function usePathPoint(
  ref: React.RefObject<SVGPathElement>,
  fraction: number,
): { x: number; y: number; totalLength: number } {
  const [totalLength, setTotalLength] = useState(0)

  useEffect(() => {
    if (!ref.current) return
    setTotalLength(ref.current.getTotalLength())
  }, [ref])

  const pointRef = useRef({ x: 0, y: 0 })
  if (ref.current && totalLength > 0) {
    const clamped = Math.max(0, Math.min(1, fraction))
    const pt = ref.current.getPointAtLength(clamped * totalLength)
    pointRef.current = { x: pt.x, y: pt.y }
  }

  return { x: pointRef.current.x, y: pointRef.current.y, totalLength }
}

/**
 * Imperatively read the (x, y) at a length without triggering re-renders.
 * Useful inside rAF loops or framer-motion `useTransform` transforms.
 */
export function pointAt(path: SVGPathElement | null, totalLength: number, fraction: number) {
  if (!path || totalLength === 0) return { x: 0, y: 0 }
  const clamped = Math.max(0, Math.min(1, fraction))
  const pt = path.getPointAtLength(clamped * totalLength)
  return { x: pt.x, y: pt.y }
}
