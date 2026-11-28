import type {WeaponOutcomeStatus} from "@gunsmith/ai/pipeline/weapon/types/WeaponOutcomeStatus";

/** What a player is told of a weapon request: the outcome without the pipeline's own bookkeeping (`nodes`, `modelCalls`). */
export interface WeaponAnswer {
  status: WeaponOutcomeStatus;
  /** The id a created result is kept under: what the page sends to put it on the library shelf. Absent when nothing was kept. */
  id?: string;
  weapon?: unknown;
  appearance?: unknown;
  reason?: string;
}
