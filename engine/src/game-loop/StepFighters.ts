import {playStep} from "@gunsmith/engine/game-loop/PlayStep";
import type {FighterInputs} from "@gunsmith/engine/game-loop/types/FighterInputs";
import type {World} from "@gunsmith/engine/game-loop/types/World";

/**
 * Plays `seconds` of game time between two people: the world's `player` by `inputs.first` and its `opponent` by
 * `inputs.second`, both by the same rules as `step` (same walking, same caps on what an input may ask for, same shots).
 * No brain thinks for the opponent, so the world's brain is dropped. The first fighter is the world's player and the
 * second its opponent, so a draw in one step (both fall together) is still a loss for the first (`decideRound`).
 */
export function stepFighters(world: World, inputs: FighterInputs, seconds: number): World {
  return playStep(
    world,
    {input: inputs.first, chooseOpponent: () => ({input: inputs.second, brain: undefined})},
    seconds,
  );
}
