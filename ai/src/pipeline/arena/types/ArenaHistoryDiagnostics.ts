import type {ArenaRelevance} from "@gunsmith/ai/pipeline/arena/types/ArenaRelevance";
import type {ArenaValidationFailure} from "@gunsmith/ai/pipeline/arena/check/validate/types/ArenaValidationFailure";

/** Internal diagnostics for pipeline tuning. Values are computed by code and exclude request text and model explanations. */
export interface ArenaHistoryDiagnostics {
  pipelineVersion: string;
  relevance: ArenaRelevance;
  codeEdits: number;
  modelRepairs: number;
  validationFailure?: ArenaValidationFailure;
}
