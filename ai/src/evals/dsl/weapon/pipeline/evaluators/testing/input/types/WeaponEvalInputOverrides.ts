import type {WeaponOutcome} from "@gunsmith/ai/pipeline/types/WeaponOutcome";

/** What a test changes about the default passing input. */
export interface WeaponEvalInputOverrides {
  outcome?: Partial<WeaponOutcome>;
}
