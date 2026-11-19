import type {ArenaOutcome} from "@gunsmith/ai/pipeline/arena/types/ArenaOutcome";

/** What the arena pipeline will do for a planned request: answer with an outcome, or throw (a timeout, a provider error). */
export type PlannedArenaOutcome = ArenaOutcome | "throws";
