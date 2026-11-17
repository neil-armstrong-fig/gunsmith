import type {World} from "@gunsmith/engine/game-loop/types/World";

/** What `recordFeedbackCues` is told about one step of the simulation: the world it began with and the one it made (whose `events` and `round` are the step's). */
export interface StepReport {
  before: World;
  after: World;
}
