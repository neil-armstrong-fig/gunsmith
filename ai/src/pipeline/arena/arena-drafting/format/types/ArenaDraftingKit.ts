import type {z} from "zod";
import type {ArenaReading} from "@gunsmith/ai/pipeline/arena/arena-drafting/format/types/ArenaReading";

/** What differs between the formats a model may answer in: the instructions it is given, and the shape of the function it answers with, and how its reply is read into a drawing. */
export interface ArenaDraftingKit {
  generationPrompt: string;
  repairPrompt: string;
  replySchema: z.ZodType;
  /** Reads the reply as this format's arena: the drawing it describes, or why it cannot be read. The drawing then meets the same checks whatever the format. */
  read(reply: unknown): ArenaReading;
}
