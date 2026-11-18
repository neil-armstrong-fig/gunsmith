import type {ArenaOutcome} from "@gunsmith/ai/pipeline/arena/types/ArenaOutcome";

/** One request and how its arena ended, kept so a person can look at it. */
export interface KeptArena {
  prompt: string;
  outcome: ArenaOutcome;
}
