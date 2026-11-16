import {DIFFICULTY} from "@gunsmith/engine/opponent/Difficulty";
import {randomOpenPoint} from "@gunsmith/engine/opponent/steering/RandomOpenPoint";
import {canWalkTo} from "@gunsmith/engine/opponent/state/acting/wander/walkable/CanWalkTo";
import type {OpponentBrain} from "@gunsmith/engine/opponent/types/OpponentBrain";
import type {OpponentContext} from "@gunsmith/engine/opponent/types/OpponentContext";

const ATTEMPTS = 6;

/**
 * The brain with a new place to wander to: an open spot at least `wanderMinDistance` away that the opponent can walk to
 * (`canWalkTo`: in a straight line with no map, or by a stair where the arena has one). The time in the state starts again. Without a
 * spot after a few tries the brain has no goal and the opponent tries again next step; the seed has moved on either way.
 */
export function pickWanderGoal(brain: OpponentBrain, context: OpponentContext): OpponentBrain {
  const {arena, opponent} = context;
  const whole = {centre: {x: arena.width / 2, y: arena.height / 2}, radius: arena.width + arena.height};
  let seed = brain.seed;
  for (let attempt = 0; attempt < ATTEMPTS; attempt++) {
    const draw = randomOpenPoint(arena, seed, whole);
    seed = draw.seed;
    const {point} = draw;
    if (
      point &&
      Math.hypot(point.x - opponent.position.x, point.y - opponent.position.y) >= DIFFICULTY.wanderMinDistance &&
      canWalkTo(arena, opponent.position, point)
    ) {
      return {...brain, seed, goal: point, secondsInState: 0};
    }
  }

  return {...brain, seed, goal: undefined};
}
