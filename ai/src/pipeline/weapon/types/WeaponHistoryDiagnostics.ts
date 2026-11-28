type WeaponRelevance = "accepted" | "irrelevant" | "unavailable" | "not-judged";
type WeaponValidationFailure = "invalid-draft" | "rating-out-of-bounds";

/** Internal diagnostics for tuning. The fields contain counts and closed values only. */
export interface WeaponHistoryDiagnostics {
  pipelineVersion: string;
  relevance: WeaponRelevance;
  codeEdits: number;
  modelRepairs: number;
  validationFailure?: WeaponValidationFailure;
}
