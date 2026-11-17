import {playStep} from "@gunsmith/engine/game-loop/PlayStep";
import type {Input} from "@gunsmith/engine/game-loop/types/Input";
import type {World} from "@gunsmith/engine/game-loop/types/World";
import {thinkOpponent} from "@gunsmith/engine/opponent/ThinkOpponent";

/**
 * Plays `seconds` of game time against the scripted opponent and returns the world that results. The same world and input
 * always give the same answer: there is no clock and no randomness in here. The caller steps in small, fixed increments
 * (`pushOutOfWalls` explains why), and the engine caps what an input may ask for, so a client cannot walk faster by asking.
 *
 * The player plays by `input` and the opponent (if there is one) by what its brain asks for (`thinkOpponent`, which also
 * gives the brain it carries into the next step). The rules of the step itself, in order, are `playStep`'s; a match between
 * two people is `stepFighters`.
 */
export function step(world: World, input: Input, seconds: number): World {
  return playStep(world, {input, chooseOpponent: thinkOpponent}, seconds);
}
