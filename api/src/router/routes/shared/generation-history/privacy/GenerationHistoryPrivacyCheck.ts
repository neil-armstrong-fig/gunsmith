import type {GenerationHistoryPrivacyCheck} from "@src/router/routes/shared/generation-history/types/GenerationHistoryPrivacyCheck";

/** Capture is enabled only by the local D1 test fixture until the assessments and Make notice are ready. */
export function generationHistoryPrivacyCheck(): GenerationHistoryPrivacyCheck | undefined {
  return undefined;
}
