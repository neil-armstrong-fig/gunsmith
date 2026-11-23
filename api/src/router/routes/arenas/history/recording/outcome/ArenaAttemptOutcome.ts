import type {ArenaHistoryDiagnostics} from "@gunsmith/ai/pipeline/arena/types/ArenaHistoryDiagnostics";
import type {ArenaOutcomeStatus} from "@gunsmith/ai/pipeline/arena/types/ArenaOutcomeStatus";
import type {AttemptOutcome} from "@src/router/routes/arenas/history/recording/types/AttemptOutcome";

export function arenaAttemptOutcome(
  status: ArenaOutcomeStatus,
  diagnostics: ArenaHistoryDiagnostics,
  response: Response,
): AttemptOutcome {
  if (status === "builtIn") {
    return {
      outcome: "failed",
      failureStage: "validation",
      failureReason: diagnostics.validationFailure ?? "no-playable-arena",
    };
  }
  if (status === "rejected") {
    if (diagnostics.relevance === "not-judged") {
      return {outcome: "rejected", failureStage: "precheck", failureReason: "precheck-refused"};
    }

    return {outcome: "rejected", failureStage: "moderation", failureReason: diagnostics.relevance};
  }
  if (!response.ok) {
    return {outcome: "failed", failureStage: "storage", failureReason: "item-not-kept"};
  }
  if (diagnostics.codeEdits > 0 || diagnostics.modelRepairs > 0) {
    return {outcome: "repaired-success"};
  }

  return {outcome: "first-pass-success"};
}
