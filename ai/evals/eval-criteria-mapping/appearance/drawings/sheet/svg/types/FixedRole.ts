import type {ColourRole} from "@gunsmith/shared/appearance/vocabulary/colour/ColourRole";

/** A colour role with one colour whatever the weapon: not nothing, and not one of the two the palette picks. */
export type FixedRole = Exclude<ColourRole, "none" | "accent" | "accent-secondary">;
