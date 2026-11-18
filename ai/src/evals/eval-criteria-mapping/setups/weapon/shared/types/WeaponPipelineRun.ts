import type {WeaponOutcome} from "@gunsmith/ai/pipeline/types/WeaponOutcome";

/** Puts one request through the real weapon pipeline on the models its driver built. */
export type WeaponPipelineRun = (prompt: string) => Promise<WeaponOutcome>;
