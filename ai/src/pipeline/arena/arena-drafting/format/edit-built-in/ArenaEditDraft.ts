import {z} from "zod";
import {arenaShapesDraftSchema} from "@gunsmith/ai/pipeline/arena/arena-shapes/draft/ArenaShapesDraft";

/**
 * An arena as an edit of a built-in one: the name of the arena it starts from, rectangles to clear back to floor, and the shapes of
 * `arenaShapesDraftSchema` to add on top, without a size (the base fixes it). Strict, so a size or a stray field is refused, not dropped.
 * Whether the base exists and whether every rectangle stays inside it is checked by `readArenaEdit`.
 */
export const arenaEditDraftSchema = arenaShapesDraftSchema
  .omit({width: true, height: true})
  .extend({base: z.string(), clears: arenaShapesDraftSchema.shape.walls});

export type ArenaEdit = z.infer<typeof arenaEditDraftSchema>;
