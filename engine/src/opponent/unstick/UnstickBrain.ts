import {DIFFICULTY} from "@gunsmith/engine/opponent/Difficulty";
import {enterState} from "@gunsmith/engine/opponent/state/EnterState";
import {oppositeSide} from "@gunsmith/engine/opponent/steering/OppositeSide";
import type {OpponentBrain} from "@gunsmith/engine/opponent/types/OpponentBrain";

/**
 * What an opponent does when it has been walking without getting anywhere (`watchForStuck`). Wandering or reloading, it
 * drops the goal it could not reach and chooses another next step. Searching, it gives up and wanders. Engaging, it turns
 * round and circles the other way, for the shortest time it holds a side. Seeking has no goal of its own to drop (the weapon is
 * the world's), so only the empty goal is cleared: a seek that gets stuck is not recovered, and `chooseState` keeps it seeking while it wins
 * the race. It only sets out with a clear line or a route, so this is rare, and is listed as not done. There is no path to
 * replan: a different goal, or a different side, is the whole of the way out.
 */
export function unstickBrain(brain: OpponentBrain): OpponentBrain {
  if (brain.state === "engage") {
    return {
      ...brain,
      strafeSide: oppositeSide(brain.strafeSide),
      strafeRemainingSeconds: DIFFICULTY.strafeMinSeconds,
    };
  }

  if (brain.state === "search") {
    return enterState(brain, "wander");
  }

  return {...brain, goal: undefined};
}
