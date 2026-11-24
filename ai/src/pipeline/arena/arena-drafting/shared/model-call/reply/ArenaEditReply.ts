import {z} from "zod";

/** The shape the model is asked to fill when it answers with an edit of a built-in arena, loose for the reason `arenaShapesReplySchema` is, and without a size: the base fixes it. */
export const arenaEditReplySchema = z.looseObject({
  name: z.string().optional().describe("a short plain name for the new arena"),
  base: z.string().optional().describe("the name of the built-in arena to start from"),
  clears: z
    .array(z.unknown())
    .optional()
    .describe("rectangles {x, y, width, height} of the base to clear back to floor"),
  walls: z.array(z.unknown()).optional().describe("wall rectangles {x, y, width, height} to add"),
  covers: z.array(z.unknown()).optional().describe("low cover rectangles {x, y, width, height} to add"),
  platforms: z.array(z.unknown()).optional().describe("raised floor rectangles {x, y, width, height, level} to add"),
  stairs: z.array(z.unknown()).optional().describe("stair tiles {x, y, direction} to add"),
});
