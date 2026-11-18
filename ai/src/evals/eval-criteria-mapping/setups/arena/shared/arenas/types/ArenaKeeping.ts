import type {EvalTier} from "@evals/eval-criteria-mapping/environment/tier/shared/types/EvalTier";

/** Where a run keeps the arenas its model generated, which tier they came from, and whether it keeps them at all. */
export interface ArenaKeeping {
  folder: string;
  tier: EvalTier;
  enabled: boolean;
}
