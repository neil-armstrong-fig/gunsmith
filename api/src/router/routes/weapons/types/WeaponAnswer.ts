import type {WeaponOutcomeStatus} from "@gunsmith/ai/pipeline/types/WeaponOutcomeStatus";

/** What a player is told of a weapon request: the outcome without the pipeline's own bookkeeping (`nodes`, `modelCalls`). */
export interface WeaponAnswer {
  status: WeaponOutcomeStatus;
  weapon?: unknown;
  appearance?: unknown;
  reason?: string;
}
