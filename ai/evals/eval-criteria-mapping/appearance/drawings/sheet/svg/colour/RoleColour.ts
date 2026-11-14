import type {ColourRole} from "@gunsmith/ai/pipeline/appearance/vocabulary/colour/ColourRole";
import type {PaletteToken} from "@gunsmith/ai/pipeline/appearance/vocabulary/colour/PaletteToken";
import type {AppearancePalette} from "@evals/eval-criteria-mapping/appearance/drawings/sheet/svg/types/AppearancePalette";
import type {FixedRole} from "@evals/eval-criteria-mapping/appearance/drawings/sheet/svg/types/FixedRole";

/** The greys `art` proposes (`simple-machinery-04`: a lighter body so the breech reads on the slate sheet). */
const FIXED_ROLE_COLOURS: Record<FixedRole, string> = {
  body: "#30404F",
  edge: "#91A2B2",
  text: "#E5EAF0",
  outline: "#10151B",
};

/** The weapon colours in `art`'s palette; yellow and pink are its proposed additions. */
const TOKEN_COLOURS: Record<PaletteToken, string> = {
  "weapon-blue": "#62B5FF",
  "weapon-orange": "#FF9B54",
  "weapon-violet": "#B6A0FF",
  "weapon-mint": "#8AD4B0",
  "weapon-yellow": "#F5D45B",
  "weapon-pink": "#F58DBA",
};

/** The colour a role draws in, for this appearance's palette. For looking at an appearance only: the game's renderer owns the real palette. */
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
