import {z} from "zod";

/** One corner of a polygon or polyline: an `[x, y]` pair, local to the part's own `x` and `y`. Finite numbers only (zod refuses NaN and infinity). */
export const appearancePointSchema = z.tuple([z.number(), z.number()]);

/** A point, read off its schema so the two cannot drift apart. */
export type AppearancePoint = z.infer<typeof appearancePointSchema>;
