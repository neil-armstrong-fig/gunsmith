import {z} from "zod";
import {ARENA_LIMITS} from "@gunsmith/engine/arena/limits/ArenaLimits";

const RECTANGLE_LIMIT = 60;

const rectangleSchema = z.object({
  x: z.number().int().min(0),
  y: z.number().int().min(0),
  width: z.number().int().min(1),
  height: z.number().int().min(1),
});

const platformSchema = rectangleSchema.extend({level: z.union([z.literal(1), z.literal(2)])}).strict();

const stairSchema = z
  .object({
    x: z.number().int().min(0),
    y: z.number().int().min(0),
    direction: z.enum(["north", "south", "west", "east"]),
  })
  .strict();

/**
 * An arena as shapes, the second way a model may be asked to describe one (the first is the drawing's rows): a size and lists of
 * rectangles and stair tiles, which code draws into the same rows (`compileArenaShapes`). A model counts characters in a row badly
 * and tiles in a rectangle well, so the format has no row to get the wrong length. Coordinates count tiles from the top-left corner
 * (0, 0): `x` towards the east, `y` towards the south. `floor`, for an arena whose outline is not a rectangle (a plus sign, an L), lists
 * the rectangles of its open area, and every tile outside them is wall. DRAFT, local to `ai/`. Strict, so a stray model field is refused, not
 * dropped. The name is checked by `arenaDraftSchema` once the shapes are drawn.
 */
export const arenaShapesDraftSchema = z
  .object({
    name: z.string(),
    width: z.number().int().min(ARENA_LIMITS.width.min).max(ARENA_LIMITS.width.max),
    height: z.number().int().min(ARENA_LIMITS.height.min).max(ARENA_LIMITS.height.max),
    walls: z.array(rectangleSchema.strict()).max(RECTANGLE_LIMIT).optional(),
    covers: z.array(rectangleSchema.strict()).max(RECTANGLE_LIMIT).optional(),
    platforms: z.array(platformSchema).max(RECTANGLE_LIMIT).optional(),
    stairs: z.array(stairSchema).max(RECTANGLE_LIMIT).optional(),
    floor: z.array(rectangleSchema.strict()).max(RECTANGLE_LIMIT).optional(),
  })
  .strict();

export type ArenaShapes = z.infer<typeof arenaShapesDraftSchema>;
