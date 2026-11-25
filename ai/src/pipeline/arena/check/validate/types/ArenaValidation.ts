import type {ArenaProblemKind} from "@gunsmith/engine/arena-validation/types/ArenaProblemKind";
import type {ArenaValidationFailure} from "@gunsmith/ai/pipeline/arena/check/validate/types/ArenaValidationFailure";
import type {ArenaDrawing} from "@gunsmith/ai/pipeline/arena/types/ArenaDrawing";

/**
 * What `validateArenaDraft` answers: the arena as written, or a sentence for every fault found (for the repair) and, when the arena was
 * read but cannot be played, the kind of each fault once (`problemKinds`, engine's, for the words a player is told; empty otherwise).
 */
export type ArenaValidation =
  | {ok: true; arena: ArenaDrawing; codeEdits: number}
  | {ok: false; errors: string[]; reason: ArenaValidationFailure; problemKinds: ArenaProblemKind[]; codeEdits: number};
