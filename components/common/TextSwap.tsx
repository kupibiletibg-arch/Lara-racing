/**
 * <TextSwap> — Lando-style per-character text rewrite on hover.
 *
 * Each character lives inside a fixed-height "char window"
 * (`.text-swap-char`, `overflow: hidden`, height `1em`). Inside the
 * window, a `.text-swap-stack` wrapper holds two copies of the glyph
 * stacked vertically — first one in the visible slot, second one
 * directly below it (clipped by the window). On hover of any
 * ancestor `.btn-fill-sweep`, the stack translates -100 %, so the
 * top glyph rolls up and the duplicate rolls into its place. Per-
 * character `transition-delay: var(--swap-delay)` (25 ms × index)
 * types the swap left-to-right instead of swapping the whole word
 * at once.
 *
 * No client JS — the whole effect lives in `app/globals.css`
 * (`.text-swap*`). This file just emits the markup.
 */
export function TextSwap({ children }: { children: string }) {
  // Split into individual glyph cells. Spaces become non-breaking
  // spaces so they retain width inside the inline-flex row.
  const chars = Array.from(children)

  return (
    <span className="text-swap" aria-label={children}>
      {chars.map((c, i) => {
        const glyph = c === ' ' ? '\u00A0' : c
        return (
          <span
            key={`${c}-${i}`}
            className="text-swap-char"
            aria-hidden
          >
            <span
              className="text-swap-stack"
              style={{ ['--swap-delay' as string]: `${i * 25}ms` }}
            >
              <span className="text-swap-glyph">{glyph}</span>
              <span className="text-swap-glyph">{glyph}</span>
            </span>
          </span>
        )
      })}
    </span>
  )
}
