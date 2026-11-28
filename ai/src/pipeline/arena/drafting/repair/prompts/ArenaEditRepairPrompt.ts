import {ARENA_EDIT_GENERATION_PROMPT} from "@gunsmith/ai/pipeline/arena/drafting/generate/prompts/ArenaEditGenerationPrompt";
import {REPAIR_INSTRUCTION} from "@gunsmith/ai/pipeline/arena/drafting/repair/prompts/RepairInstruction";

/** The arena builder's instructions for its one second try, answering with an edit of a built-in arena: the same task, plus the note that the first answer was refused. */
export const ARENA_EDIT_REPAIR_PROMPT = `${ARENA_EDIT_GENERATION_PROMPT}

${REPAIR_INSTRUCTION}`;
