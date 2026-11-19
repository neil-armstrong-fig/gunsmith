import type {z} from "zod";

/** What differs between the formats a model may answer in: the instructions it is given, and the shape of the function it answers with. */
export interface ArenaDraftingKit {
  generationPrompt: string;
  repairPrompt: string;
  replySchema: z.ZodType;
}
