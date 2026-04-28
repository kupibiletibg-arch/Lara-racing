/**
 * <TextSwap> — Lando-style per-character text rewrite on hover.
 *
 * Stacks two copies of every glyph vertically inside an
 * overflow-hidden char wrapper. When any ancestor with
 * `.btn-fill-sweep` is hovered (or focus-visible), each char
 * translates -100 %, so the original glyph slides up and the
 * duplicate underneath rolls into its place. A small per-character
 * delay (25 ms × index) types the new word left-to-right instead of
 * swapping the whole row at once.
 *
 * No client-side JS needed — the entire effect is CSS in
 * `app/globals.css` (`.text-swap*`). This file just emits the markup.
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
            style={{ ['--swap-delay' as string]: `${i * 25}ms` }}
          >
            <span className="text-swap-glyph">{glyph}</span>
            <span className="text-swap-glyph">{glyph}</span>
          </span>
        )
      })}
    </span>
  )
}
