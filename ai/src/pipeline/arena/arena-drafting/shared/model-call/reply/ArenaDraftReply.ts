import {z} from "zod";

/**
 * The shape the model is asked to fill, and deliberately a loose one: a name and a list of text rows, none required and any extra
 * field kept. LangChain parses a structured answer against the schema it is given and throws on a value outside it, which would hide
 * the answer from `validate` and `repair`. So the limits live in the prompt, and the strict schema (`arenaDraftSchema`) is applied
 * afterwards, by code, where a refusal can be repaired. A value of the wrong type still throws here, and the model call turns that
 * into no answer.
 */
export const arenaDraftReplySchema = z.looseObject({
  name: z.string().optional().describe("a short plain name for the arena"),
  rows: z.array(z.string()).optional().describe("the arena drawn as text rows, north first, every row the same length"),
});
