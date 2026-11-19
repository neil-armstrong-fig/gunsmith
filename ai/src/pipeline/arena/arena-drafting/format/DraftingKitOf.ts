import {ARENA_GENERATION_PROMPT} from "@gunsmith/ai/pipeline/arena/arena-drafting/generate/prompts/ArenaGenerationPrompt";
import {ARENA_SHAPES_GENERATION_PROMPT} from "@gunsmith/ai/pipeline/arena/arena-drafting/generate/prompts/ArenaShapesGenerationPrompt";
import type {ArenaFormat} from "@gunsmith/ai/pipeline/arena/arena-drafting/format/ArenaFormat";
import type {ArenaDraftingKit} from "@gunsmith/ai/pipeline/arena/arena-drafting/format/types/ArenaDraftingKit";
import {ARENA_REPAIR_PROMPT} from "@gunsmith/ai/pipeline/arena/arena-drafting/repair/prompts/ArenaRepairPrompt";
import {ARENA_SHAPES_REPAIR_PROMPT} from "@gunsmith/ai/pipeline/arena/arena-drafting/repair/prompts/ArenaShapesRepairPrompt";
import {arenaDraftReplySchema} from "@gunsmith/ai/pipeline/arena/arena-drafting/shared/model-call/reply/ArenaDraftReply";
import {arenaShapesReplySchema} from "@gunsmith/ai/pipeline/arena/arena-drafting/shared/model-call/reply/ArenaShapesReply";

const ROWS_KIT: ArenaDraftingKit = {
  generationPrompt: ARENA_GENERATION_PROMPT,
  repairPrompt: ARENA_REPAIR_PROMPT,
  replySchema: arenaDraftReplySchema,
};

const SHAPES_KIT: ArenaDraftingKit = {
  generationPrompt: ARENA_SHAPES_GENERATION_PROMPT,
  repairPrompt: ARENA_SHAPES_REPAIR_PROMPT,
  replySchema: arenaShapesReplySchema,
};

/** The instructions and the function the model is given for the format it answers in. */
export function draftingKitOf(format: ArenaFormat): ArenaDraftingKit {
  if (format === "shapes") {
    return SHAPES_KIT;
  }

  return ROWS_KIT;
}
