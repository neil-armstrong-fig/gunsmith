import type {EvalTier} from "@evals/eval-criteria-mapping/environment/tier/shared/types/EvalTier";

/**
 * What a tier's driver tells its domain's base class: which tier it is (the name of the files it keeps), what the run asked for,
 * what it runs by default, and whether it keeps what its model generated unless told. Passed up in the constructor, because a
 * subclass's own fields do not exist yet while the base class is being built.
 */
export interface TierDriverSettings {
  tier: EvalTier;
  requestedTrials: string | undefined;
  defaultTrials: number;
  keepsGeneratedByDefault: boolean;
}
