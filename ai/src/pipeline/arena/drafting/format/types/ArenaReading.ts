import type {ArenaValidationFailure} from "@gunsmith/ai/pipeline/arena/check/validate/types/ArenaValidationFailure";

/**
 * What reading a model's reply in its format gives: the drawing it describes (not yet checked), or a sentence for each fault that stopped
 * the reading and the kind of fault it was (`invalid-draft`: the reply did not fit the schema; `invalid-shapes`: its shapes or edits could not be drawn).
 */
export type ArenaReading = {ok: true; drawing: unknown} | {ok: false; errors: string[]; reason: ArenaValidationFailure};
