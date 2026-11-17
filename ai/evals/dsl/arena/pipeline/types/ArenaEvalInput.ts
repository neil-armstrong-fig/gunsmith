import type {ArenaOutcome} from "@gunsmith/ai/pipeline/arena/types/ArenaOutcome";

/** What an arena evaluator is given: what the pipeline answered to one trial. */
export interface ArenaEvalInput {
  outcome: ArenaOutcome;
}
