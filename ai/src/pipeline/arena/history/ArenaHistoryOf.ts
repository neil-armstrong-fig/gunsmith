import type {ArenaGraphStateValues} from "@gunsmith/ai/pipeline/arena/arena-graph/state/types/ArenaGraphStateValues";
import type {ArenaHistoryDiagnostics} from "@gunsmith/ai/pipeline/arena/types/ArenaHistoryDiagnostics";

const ARENA_PIPELINE_VERSION = "arena-v1";

export function arenaHistoryOf(state: ArenaGraphStateValues): ArenaHistoryDiagnostics {
  const diagnostics: ArenaHistoryDiagnostics = {
    pipelineVersion: ARENA_PIPELINE_VERSION,
    relevance: state.relevance ?? "not-judged",
    codeEdits: state.codeEdits,
    modelRepairs: state.nodes.filter(node => node === "repair").length,
  };
  if (state.builtIn !== undefined && state.validationFailure !== undefined) {
    diagnostics.validationFailure = state.validationFailure;
  }

  return diagnostics;
}
