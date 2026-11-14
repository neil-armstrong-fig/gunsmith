import {DIFFICULTY} from "@gunsmith/engine/opponent/Difficulty";
import {walkToward} from "@gunsmith/engine/opponent/steering/WalkToward";
import {pickWanderGoal} from "@gunsmith/engine/opponent/state/acting/wander/PickWanderGoal";
import type {OpponentBrain} from "@gunsmith/engine/opponent/types/OpponentBrain";
import type {OpponentContext} from "@gunsmith/engine/opponent/types/OpponentContext";
import type {StateAct} from "@gunsmith/engine/opponent/types/StateAct";

/**
 * Wandering: walk to a spot it can see, aiming where it walks, and choose another on arrival or after
 * `wanderRepickSeconds` on the way. It does not fire and does not reload. Spotting the player is `chooseState`'s business.
 */
export function actWander(brain: OpponentBrain, context: OpponentContext): StateAct {
  const planned = planGoal(brain, context);
  const {goal} = planned;
  if (!goal) {
    return {input: {direction: {x: 0, y: 0}, firing: false, reload: false}, brain: planned};
  }

  return {
    input: {direction: walkToward(context.opponent.position, goal), aimAt: goal, firing: false, reload: false},
    brain: planned,
  };
}

function planGoal(brain: OpponentBrain, context: OpponentContext): OpponentBrain {
  if (needsNewGoal(brain, context)) {
    return pickWanderGoal(brain, context);
  }

  return brain;
}

function needsNewGoal(brain: OpponentBrain, context: OpponentContext): boolean {
  const {goal} = brain;
  if (!goal) {
    return true;
  }

  const arrived =
    Math.hypot(goal.x - context.opponent.position.x, goal.y - context.opponent.position.y) < DIFFICULTY.arrivalRadius;

  return arrived || brain.secondsInState >= DIFFICULTY.wanderRepickSeconds;
}
