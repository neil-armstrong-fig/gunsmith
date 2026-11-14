import {z} from "zod";
import {APPEARANCE_LIMITS} from "@gunsmith/ai/pipeline/appearance/schema/AppearanceLimits";
import {appearancePointSchema} from "@gunsmith/ai/pipeline/appearance/schema/part/point/AppearancePoint";
import {COLOUR_ROLES} from "@gunsmith/ai/pipeline/appearance/vocabulary/colour/ColourRole";
import {DETAIL_TIERS} from "@gunsmith/ai/pipeline/appearance/vocabulary/detail/DetailTier";

/** What every part has: where it is, how it is coloured and drawn. A circle or ellipse's `x`, `y` is its centre; a rectangle's is its upper-left corner; a polygon or polyline's is the origin its points are local to. Rotation turns the part about that `x`, `y`. */
const COMMON_FIELDS = {
  x: z.number(),
  y: z.number(),
  fill: z.enum(COLOUR_ROLES),
  stroke: z.enum(COLOUR_ROLES),
  strokeWidth: z.number().min(APPEARANCE_LIMITS.strokeWidth.min).max(APPEARANCE_LIMITS.strokeWidth.max),
  opacity: z.number().min(APPEARANCE_LIMITS.opacity.min).max(APPEARANCE_LIMITS.opacity.max),
  rotation: z.number().min(APPEARANCE_LIMITS.rotationDegrees.min).max(APPEARANCE_LIMITS.rotationDegrees.max),
  detail: z.enum(DETAIL_TIERS),
};

/** A radius, width or height: more than nothing. How far it may reach is the bounds check's, once it is placed and turned. */
const SIZE = z.number().positive();

function pointList(minimum: number): z.ZodArray<typeof appearancePointSchema> {
  return z.array(appearancePointSchema).min(minimum).max(APPEARANCE_LIMITS.pointsPerPart.max);
}

/**
 * One drawing primitive, a strict union on `kind`: each kind takes only its own geometry and a stray field is refused, not
 * dropped. Five kinds, no path strings, no nesting. DRAFT, local to `ai/` (`docs/art/concepts/top-down-oddities/README.md` is the field dictionary).
 */
export const appearancePartSchema = z.discriminatedUnion("kind", [
  z.strictObject({kind: z.literal("circle"), ...COMMON_FIELDS, radius: SIZE}),
  z.strictObject({kind: z.literal("ellipse"), ...COMMON_FIELDS, radiusX: SIZE, radiusY: SIZE}),
  z.strictObject({kind: z.literal("rect"), ...COMMON_FIELDS, width: SIZE, height: SIZE}),
  z.strictObject({kind: z.literal("polygon"), ...COMMON_FIELDS, points: pointList(3)}),
  z.strictObject({kind: z.literal("polyline"), ...COMMON_FIELDS, points: pointList(2)}),
]);

/** A part, read off its schema so the two cannot drift apart. */
export type AppearancePart = z.infer<typeof appearancePartSchema>;
