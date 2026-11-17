import {DIFFICULTY} from "@gunsmith/engine/opponent/Difficulty";
import {routeWaypoint} from "@gunsmith/engine/opponent/steering/RouteWaypoint";
import {walkToward} from "@gunsmith/engine/opponent/steering/WalkToward";
import {pickWanderGoal} from "@gunsmith/engine/opponent/state/acting/wander/PickWanderGoal";
import type {OpponentBrain} from "@gunsmith/engine/opponent/types/OpponentBrain";
import type {OpponentContext} from "@gunsmith/engine/opponent/types/OpponentContext";
import type {StateAct} from "@gunsmith/engine/opponent/types/StateAct";

/**
 * Wandering: walk to a spot it can walk to (by a stair, if the arena has one), aiming where it walks, and choose another on arrival or after
 * `wanderRepickSeconds` on the way. It does not fire and does not reload. Spotting the player is `chooseState`'s business.
 */
export function actWander(brain: OpponentBrain, context: OpponentContext): StateAct {
  const planned = planGoal(brain, context);
  const {goal} = planned;
  if (!goal) {
    return {input: {direction: {x: 0, y: 0}, firing: false, reload: false}, brain: planned};
  }

  const waypoint = routeWaypoint(context.arena, context.opponent.position, goal);

  return {
    input: {direction: walkToward(context.opponent.position, waypoint), aimAt: waypoint, firing: false, reload: false},
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
