/**
 * The named weapon colours a generated appearance may pick for its two accents, never a colour value (`art`'s palette,
 * `docs/art/concepts/top-down-oddities/README.md`). Yellow and pink are art's proposed additions, pending the palette review.
 */
export const PALETTE_TOKENS = [
  "weapon-blue",
  "weapon-orange",
  "weapon-violet",
  "weapon-mint",
  "weapon-yellow",
  "weapon-pink",
] as const;

/** One weapon colour name, read off the list so the two cannot drift apart. */
export type PaletteToken = (typeof PALETTE_TOKENS)[number];
