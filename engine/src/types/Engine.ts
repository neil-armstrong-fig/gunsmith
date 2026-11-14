import type {startingWorld} from "@gunsmith/engine/game-loop/StartingWorld";
import type {step} from "@gunsmith/engine/game-loop/Step";

/** What a caller drives the game with: the first world of a round, and the step that moves a world on. */
export interface Engine {
  /** The first world of a round in an arena. */
  startingWorld: typeof startingWorld;
  /** Moves a world on by one fixed step. The loop that calls it at a steady rate belongs to the caller. */
  step: typeof step;
}
