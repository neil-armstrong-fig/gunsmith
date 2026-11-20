import type {ArenaOutcome} from "@gunsmith/ai/pipeline/arena/types/ArenaOutcome";

/** Puts one request through the real arena pipeline on the models its driver built. */
export type ArenaPipelineRun = (prompt: string) => Promise<ArenaOutcome>;
