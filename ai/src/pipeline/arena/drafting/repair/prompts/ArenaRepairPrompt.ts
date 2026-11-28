import {ARENA_GENERATION_PROMPT} from "@gunsmith/ai/pipeline/arena/drafting/generate/prompts/ArenaGenerationPrompt";
import {REPAIR_INSTRUCTION} from "@gunsmith/ai/pipeline/arena/drafting/repair/prompts/RepairInstruction";

/** The arena builder's instructions for its one second try, answering in rows: the same task, plus the note that the first answer was refused. */
export const ARENA_REPAIR_PROMPT = `${ARENA_GENERATION_PROMPT}

${REPAIR_INSTRUCTION}`;
