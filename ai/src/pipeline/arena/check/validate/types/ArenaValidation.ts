import type {ArenaValidationFailure} from "@gunsmith/ai/pipeline/arena/check/validate/types/ArenaValidationFailure";
import type {ArenaDrawing} from "@gunsmith/ai/pipeline/arena/types/ArenaDrawing";

/** What `validateArenaDraft` answers: the arena as written, or a sentence for every fault found. */
export type ArenaValidation =
  | {ok: true; arena: ArenaDrawing; codeEdits: number}
  | {ok: false; errors: string[]; reason: ArenaValidationFailure; codeEdits: number};
