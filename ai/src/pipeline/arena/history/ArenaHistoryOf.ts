import type {ArenaGraphStateValues} from "@gunsmith/ai/pipeline/arena/arena-graph/state/types/ArenaGraphStateValues";
import {ARENA_PIPELINE_VERSION} from "@gunsmith/ai/pipeline/arena/history/ArenaPipelineVersion";
import type {ArenaHistoryDiagnostics} from "@gunsmith/ai/pipeline/arena/types/ArenaHistoryDiagnostics";

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
