import type {ColourRole} from "@gunsmith/shared/appearance/vocabulary/colour/ColourRole";
import type {PaletteToken} from "@gunsmith/shared/appearance/vocabulary/colour/PaletteToken";
import type {AppearancePalette} from "@src/react/components/three/arena-canvas/components/arena-scene/components/pickup/hooks/use-weapon-drawing/texture/load-weapon-drawing/svg/types/AppearancePalette";
import type {FixedRole} from "@src/react/components/three/arena-canvas/components/arena-scene/components/pickup/hooks/use-weapon-drawing/texture/load-weapon-drawing/svg/types/FixedRole";

// The game's own colours for what a generated weapon is drawn in, the same as the palette tokens in `index.css` (`RoleColour.test.ts` reads the file and checks each).
// Body is art's README value, the wall's dark (`--color-gs-wall`): the eval review sheet's lighter grey was chosen only so the breech reads on its slate page, and
// `#30404F` is also the floor and the fighters' body, which a weapon lying on the floor must not be. Outline is the background's, `--color-gs-background`.
const FIXED_ROLE_COLOURS: Record<FixedRole, string> = {
  body: "#18212B",
  edge: "#91A2B2",
  text: "#E5EAF0",
  outline: "#10151B",
};

// Yellow and pink are art's proposed additions (`docs/art/concepts/top-down-oddities/README.md`); the game has no token for them until M2 adopts them.
const TOKEN_COLOURS: Record<PaletteToken, string> = {
  "weapon-blue": "#62B5FF",
  "weapon-orange": "#FF9B54",
  "weapon-violet": "#B6A0FF",
  "weapon-mint": "#8AD4B0",
  "weapon-yellow": "#F5D45B",
  "weapon-pink": "#F58DBA",
};

/** The colour a role is drawn in for this appearance's palette: a fixed grey, the accent the palette names, or `none` for nothing drawn. */
export function roleColour(role: ColourRole, palette: AppearancePalette): string {
  if (role === "none") {
    return "none";
  }

  if (role === "accent") {
    return TOKEN_COLOURS[palette.accent];
  }

  if (role === "accent-secondary") {
    return TOKEN_COLOURS[palette["accent-secondary"]];
  }

  return FIXED_ROLE_COLOURS[role];
}
