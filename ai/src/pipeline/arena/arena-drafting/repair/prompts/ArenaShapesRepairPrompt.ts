import {ARENA_SHAPES_GENERATION_PROMPT} from "@gunsmith/ai/pipeline/arena/arena-drafting/generate/prompts/ArenaShapesGenerationPrompt";
import {REPAIR_INSTRUCTION} from "@gunsmith/ai/pipeline/arena/arena-drafting/repair/prompts/RepairInstruction";

/** The arena builder's instructions for its one second try, answering in shapes: the same task, plus the note that the first answer was refused. */
export const ARENA_SHAPES_REPAIR_PROMPT = `${ARENA_SHAPES_GENERATION_PROMPT}

${REPAIR_INSTRUCTION}`;
