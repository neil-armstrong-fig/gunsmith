import type {World} from "@gunsmith/engine/game-loop/types/World";

/** What the local hit placement reads about one simulation step: the world it began with and the one it made (whose `events` and `round` are the step's). */
export interface StepReport {
  before: World;
  after: World;
}
