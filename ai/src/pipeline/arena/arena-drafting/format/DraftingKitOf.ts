import {ARENA_GENERATION_PROMPT} from "@gunsmith/ai/pipeline/arena/arena-drafting/generate/prompts/ArenaGenerationPrompt";
import {ARENA_SHAPES_GENERATION_PROMPT} from "@gunsmith/ai/pipeline/arena/arena-drafting/generate/prompts/ArenaShapesGenerationPrompt";
import type {ArenaFormat} from "@gunsmith/ai/pipeline/arena/arena-drafting/format/ArenaFormat";
import type {ArenaDraftingKit} from "@gunsmith/ai/pipeline/arena/arena-drafting/format/types/ArenaDraftingKit";
import {ARENA_REPAIR_PROMPT} from "@gunsmith/ai/pipeline/arena/arena-drafting/repair/prompts/ArenaRepairPrompt";
import {ARENA_SHAPES_REPAIR_PROMPT} from "@gunsmith/ai/pipeline/arena/arena-drafting/repair/prompts/ArenaShapesRepairPrompt";
import {arenaDraftReplySchema} from "@gunsmith/ai/pipeline/arena/arena-drafting/shared/model-call/reply/ArenaDraftReply";
import {ARENA_EDIT_GENERATION_PROMPT} from "@gunsmith/ai/pipeline/arena/arena-drafting/generate/prompts/ArenaEditGenerationPrompt";
import {ARENA_EDIT_REPAIR_PROMPT} from "@gunsmith/ai/pipeline/arena/arena-drafting/repair/prompts/ArenaEditRepairPrompt";
import {readArenaEdit} from "@gunsmith/ai/pipeline/arena/arena-drafting/format/edit-built-in/ReadArenaEdit";
import {arenaEditReplySchema} from "@gunsmith/ai/pipeline/arena/arena-drafting/shared/model-call/reply/ArenaEditReply";
import {readArenaShapes} from "@gunsmith/ai/pipeline/arena/arena-shapes/ReadArenaShapes";
import {arenaShapesReplySchema} from "@gunsmith/ai/pipeline/arena/arena-drafting/shared/model-call/reply/ArenaShapesReply";

// A record, so a format added to `ARENA_FORMATS` without a kit is a type error, not a silent fall back to rows.
const KITS: Record<ArenaFormat, ArenaDraftingKit> = {
  rows: {
    generationPrompt: ARENA_GENERATION_PROMPT,
    repairPrompt: ARENA_REPAIR_PROMPT,
    replySchema: arenaDraftReplySchema,
    read: reply => ({ok: true, drawing: reply}),
  },
  shapes: {
    generationPrompt: ARENA_SHAPES_GENERATION_PROMPT,
    repairPrompt: ARENA_SHAPES_REPAIR_PROMPT,
    replySchema: arenaShapesReplySchema,
    read: readArenaShapes,
  },
  editBuiltIn: {
    generationPrompt: ARENA_EDIT_GENERATION_PROMPT,
    repairPrompt: ARENA_EDIT_REPAIR_PROMPT,
    replySchema: arenaEditReplySchema,
    read: readArenaEdit,
  },
};

/** The instructions, the function and the reading the model's reply is given for the format it answers in. */
export function draftingKitOf(format: ArenaFormat): ArenaDraftingKit {
  return KITS[format];
}
