import {startingWorld} from "@gunsmith/engine/game-loop/StartingWorld";
import {step} from "@gunsmith/engine/game-loop/Step";
import type {Engine} from "@gunsmith/engine/types/Engine";

/**
 * The engine's front door: the two calls that run a game, a first world and a step. The rest of `engine/` (the arena, the
 * match, the weapons) is vocabulary a caller reaches by its own path, so this is not a barrel and re-exports nothing else.
 * The engine has no clock, so the caller runs `step` at a fixed rate.
 */
export const engine: Engine = {startingWorld, step};
