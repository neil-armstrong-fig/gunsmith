import type {ArenaDrawing} from "@gunsmith/ai/pipeline/arena/types/ArenaDrawing";

/** What `validateArenaDraft` answers: the arena as written, or a sentence for every fault found. */
export type ArenaValidation = {ok: true; arena: ArenaDrawing} | {ok: false; errors: string[]};
