'use client'

import { motion, type Variants } from 'framer-motion'
import type { ReactNode } from 'react'

/**
 * Scroll-driven section reveal primitives.
 *
 *   <Reveal>          single block fades + rises into view once
 *   <RevealStagger>   parent that orchestrates children via
 *                     framer-motion's `staggerChildren`
 *   <RevealItem>      child cell inside a <RevealStagger>
 *
 * Defaults: 24 px Y-rise + opacity, 0.7 s duration,
 * cubic-bezier(0.22, 0.8, 0.3, 1) — same easing IntroSequence and
 * SocialFan already use, so the new reveals feel of-a-piece.
 *
 * `viewport.once: true` everywhere so a section reveals exactly
 * once per page instance and stays put after that.
 *
 * Reduced motion: framer-motion auto-shorts variants, AND the
 * existing global CSS rule kills any leftover transitions, so no
 * extra wiring required.
 */

const REVEAL_DURATION = 0.7
const REVEAL_EASE: [number, number, number, number] = [0.22, 0.8, 0.3, 1]
const REVEAL_RISE = 24
const STAGGER_GAP = 0.09

const itemVariants: Variants = {
  hidden: { opacity: 0, y: REVEAL_RISE },
  show: { opacity: 1, y: 0 },
}

type Common = {
  className?: string
  children: ReactNode
}

export function Reveal({
  className,
  children,
  delay = 0,
  amount = 0.2,
}: Common & {
  /** Extra delay (seconds) before this block reveals. */
  delay?: number
  /**
   * Fraction of the element that has to be in view before the
   * reveal fires. Lower = earlier; default 0.2 (20 %).
   */
  amount?: number
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
      variants={itemVariants}
      transition={{ duration: REVEAL_DURATION, ease: REVEAL_EASE, delay }}
    >
      {children}
    </motion.div>
  )
}

export function RevealStagger({
  className,
  children,
  amount = 0.15,
  staggerGap = STAGGER_GAP,
  delayChildren = 0,
}: Common & {
  amount?: number
  /** Override the default 90 ms gap between siblings. */
  staggerGap?: number
  /** Hold the whole stagger by this many seconds before it kicks off. */
  delayChildren?: number
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: staggerGap,
            delayChildren,
          },
        },
      }}
    >
      {children}
    </motion.div>
  )
}

export function RevealItem({ className, children }: Common) {
  return (
    <motion.div
      className={className}
      variants={itemVariants}
      transition={{ duration: REVEAL_DURATION, ease: REVEAL_EASE }}
    >
      {children}
    </motion.div>
  )
}
