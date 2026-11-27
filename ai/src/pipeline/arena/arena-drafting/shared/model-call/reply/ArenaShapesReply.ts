import {z} from "zod";

/**
 * The shape the model is asked to fill when it answers in shapes, and a loose one for the reason `arenaDraftReplySchema` is: LangChain
 * throws on a value outside the schema it is given, which would hide the answer from `validate` and `repair`. The lists are kept as
 * they come (`unknown` items); `arenaShapesDraftSchema` reads them afterwards, by code, where a refusal can be repaired.
 */
export const arenaShapesReplySchema = z.looseObject({
  name: z.string().optional().describe("a short plain name for the arena"),
  width: z.number().optional().describe("how many tiles wide the arena is"),
  height: z.number().optional().describe("how many tiles tall the arena is"),
  walls: z.array(z.unknown()).optional().describe("wall rectangles {x, y, width, height}, inside the border"),
  covers: z.array(z.unknown()).optional().describe("low cover rectangles {x, y, width, height}"),
  platforms: z.array(z.unknown()).optional().describe("raised floor rectangles {x, y, width, height, level}"),
  stairs: z.array(z.unknown()).optional().describe("stair tiles {x, y, direction}"),
  floor: z
    .array(z.unknown())
    .optional()
    .describe("rectangles {x, y, width, height} that make the open area; every tile outside them is wall"),
});
