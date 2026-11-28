import type {WeaponOutcome} from "@gunsmith/ai/pipeline/weapon/types/WeaponOutcome";

/** What the pipeline will do for a planned request: answer with an outcome, or throw (a timeout, a provider error). */
export type PlannedOutcome = WeaponOutcome | "throws";
