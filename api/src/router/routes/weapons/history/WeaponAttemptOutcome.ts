import type {WeaponHistoryDiagnostics} from "@gunsmith/ai/pipeline/weapon/types/WeaponHistoryDiagnostics";
import type {WeaponOutcome} from "@gunsmith/ai/pipeline/weapon/types/WeaponOutcome";
import type {AttemptOutcome} from "@src/router/routes/shared/generation-history/types/AttemptOutcome";

export function weaponAttemptOutcome(
  outcome: WeaponOutcome,
  diagnostics: WeaponHistoryDiagnostics,
  response: Response,
): AttemptOutcome {
  if (outcome.status === "rejected") {
    if (diagnostics.relevance === "not-judged") {
      return {outcome: "rejected", failureStage: "precheck", failureReason: "precheck-refused"};
    }

    return {outcome: "rejected", failureStage: "moderation", failureReason: diagnostics.relevance};
  }

  if (outcome.status === "invalid") {
    return {
      outcome: "failed",
      failureStage: "validation",
      failureReason: diagnostics.validationFailure ?? "invalid-draft",
    };
  }

  if (!response.ok) {
    return {outcome: "failed", failureStage: "storage", failureReason: "item-not-kept"};
  }

  if (outcome.appearance?.status === "fallback") {
    return {outcome: "success-with-fallback"};
  }

  if (diagnostics.codeEdits > 0 || diagnostics.modelRepairs > 0) {
    return {outcome: "repaired-success"};
  }

  return {outcome: "first-pass-success"};
}
