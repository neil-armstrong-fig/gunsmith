import type {AppearanceOutcome} from "@gunsmith/ai/pipeline/appearance/types/AppearanceOutcome";

/** Puts one request through the real appearance pipeline on the models its driver built. */
export type AppearancePipelineRun = (prompt: string) => Promise<AppearanceOutcome>;
