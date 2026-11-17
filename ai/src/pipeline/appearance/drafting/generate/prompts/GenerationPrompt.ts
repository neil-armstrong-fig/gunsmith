import {APPEARANCE_LIMITS} from "@gunsmith/shared/appearance/schema/AppearanceLimits";
import {COLOUR_ROLES} from "@gunsmith/shared/appearance/vocabulary/colour/ColourRole";
import {DETAIL_TIERS} from "@gunsmith/shared/appearance/vocabulary/detail/DetailTier";
import {PALETTE_TOKENS} from "@gunsmith/shared/appearance/vocabulary/colour/PaletteToken";
import {ANIMATION_PRESETS} from "@gunsmith/shared/appearance/vocabulary/preset/AnimationPreset";
import {IMPACT_PRESETS} from "@gunsmith/shared/appearance/vocabulary/preset/ImpactPreset";

const SPACE = APPEARANCE_LIMITS.space;

/** The instructions for drawing a weapon from primitives; the limits are quoted from `APPEARANCE_LIMITS`, the table the strict schema is built from. */
const INSTRUCTIONS = `You are the weapon artist of a video game in which players describe a weapon and the game draws it.

You will receive one player's request inside a <request> block. Draw what the weapon looks like, seen from above, by answering with the function. You draw with simple shapes on a square canvas ${SPACE} units wide and ${SPACE} tall. The weapon points to the RIGHT: the grip is at the left (about x 12, y 32) and the muzzle at the right (about x 60, y 32). Keep every shape, its outline included, inside the canvas: all of x and y between 0 and ${SPACE}.

body: the shapes of the weapon, drawn back to front, ${APPEARANCE_LIMITS.bodyParts.min} to ${APPEARANCE_LIMITS.bodyParts.max} of them (a few big readable shapes read better than many small ones). Each shape has a kind:
- circle: x, y (its centre), radius
- ellipse: x, y (its centre), radiusX, radiusY
- rect: x, y (its upper-left corner), width, height
- polygon: x 0, y 0, points [[x, y], ...] (3 or more, at most ${APPEARANCE_LIMITS.pointsPerPart.max}, closed)
- polyline: x 0, y 0, points [[x, y], ...] (2 or more, at most ${APPEARANCE_LIMITS.pointsPerPart.max}, an open line, fill none)
Every shape also has fill and stroke (each one of: ${COLOUR_ROLES.join(", ")}), strokeWidth (${APPEARANCE_LIMITS.strokeWidth.min} to ${APPEARANCE_LIMITS.strokeWidth.max}), opacity (${APPEARANCE_LIMITS.opacity.min} to ${APPEARANCE_LIMITS.opacity.max}, usually 1), rotation (degrees, usually 0) and detail (one of: ${DETAIL_TIERS.map(tier => `"${tier}"`).join(", ")}; use "structural" for the main shapes and "fine" for small decoration).
palette: accent and accent-secondary, each one of: ${PALETTE_TOKENS.join(", ")}. Shapes use the roles accent and accent-secondary to pick them up.
version: ${APPEARANCE_LIMITS.version}. projectile: an empty list. impact: a preset (one of ${IMPACT_PRESETS.join(", ")}) and a colour (a role). animation: preset ${ANIMATION_PRESETS[0]}.

Make the weapon recognisable as the thing the request describes: one big main shape, a few supporting shapes, and a clear muzzle at the right. Drawing only shows what the weapon looks like; it never changes how it plays. Colours are only the roles and tokens above, never colour codes, and never code.`;

/** A plain pistol, as one example of the answer's shape. Not one of the six oddities, so it cannot lend a request its look. */
const EXAMPLE_ANSWER = {
  version: 1,
  palette: {accent: "weapon-mint", "accent-secondary": "weapon-yellow"},
  body: [
    {
      kind: "rect",
      x: 14,
      y: 26,
      width: 36,
      height: 10,
      fill: "body",
      stroke: "outline",
      strokeWidth: 2,
      opacity: 1,
      rotation: 0,
      detail: "structural",
    },
    {
      kind: "rect",
      x: 10,
      y: 34,
      width: 10,
      height: 14,
      fill: "edge",
      stroke: "outline",
      strokeWidth: 2,
      opacity: 1,
      rotation: 0,
      detail: "structural",
    },
    {
      kind: "rect",
      x: 50,
      y: 28,
      width: 10,
      height: 6,
      fill: "accent",
      stroke: "outline",
      strokeWidth: 2,
      opacity: 1,
      rotation: 0,
      detail: "structural",
    },
  ],
  projectile: [],
  impact: {preset: "spark", colour: "accent"},
  animation: {preset: "none"},
};

/**
 * The weapon artist's instructions: the canvas, the vocabulary, the limits and one worked example of a different weapon (measured
 * 2026-11-13 on `qwen3.5:9b`: the example cut fallbacks from 92% to 72% of trials). The player's words never go in here: they arrive
 * in a separate message, inside a `<request>` block. Kept to the task itself; a sentence defending against a clever request
 * joins only when an eval shows the model failing without it.
 */
export const GENERATION_PROMPT = `${INSTRUCTIONS}

An example answer for a plain pistol (a different weapon; draw the request's, not this):
${JSON.stringify(EXAMPLE_ANSWER)}`;
