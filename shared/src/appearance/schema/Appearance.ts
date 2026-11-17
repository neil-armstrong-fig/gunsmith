import {z} from "zod";
import {APPEARANCE_LIMITS} from "@gunsmith/shared/appearance/schema/AppearanceLimits";
import {appearancePartSchema} from "@gunsmith/shared/appearance/schema/part/AppearancePart";
import {COLOUR_ROLES} from "@gunsmith/shared/appearance/vocabulary/colour/ColourRole";
import {PALETTE_TOKENS} from "@gunsmith/shared/appearance/vocabulary/colour/PaletteToken";
import {ANIMATION_PRESETS} from "@gunsmith/shared/appearance/vocabulary/preset/AnimationPreset";
import {IMPACT_PRESETS} from "@gunsmith/shared/appearance/vocabulary/preset/ImpactPreset";

/**
 * What a generated weapon looks like: a body drawn in a 64 by 64 space, a projectile, an impact and an animation, all from a
 * fixed vocabulary a renderer interprets (never code, never a colour value). Strict, so a stray model field is refused, not
 * dropped. This is the schema alone; the budgets and the bounds that need a sum or a transform are `validateAppearance`'s.
 * DRAFT, local to `ai/` and an experiment for `build`, `art` and the user to react to, **not a contract**.
 */
export const appearanceSchema = z.strictObject({
  version: z.literal(APPEARANCE_LIMITS.version),
  palette: z.strictObject({
    accent: z.enum(PALETTE_TOKENS),
    "accent-secondary": z.enum(PALETTE_TOKENS),
  }),
  body: z.array(appearancePartSchema).min(APPEARANCE_LIMITS.bodyParts.min).max(APPEARANCE_LIMITS.bodyParts.max),
  projectile: z.array(appearancePartSchema).max(APPEARANCE_LIMITS.projectileParts.max),
  impact: z.strictObject({preset: z.enum(IMPACT_PRESETS), colour: z.enum(COLOUR_ROLES)}),
  animation: z.strictObject({preset: z.enum(ANIMATION_PRESETS)}),
});

/** The appearance, read off its schema so the two cannot drift apart. */
export type Appearance = z.infer<typeof appearanceSchema>;
