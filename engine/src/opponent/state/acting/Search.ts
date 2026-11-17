import {DIFFICULTY} from "@gunsmith/engine/opponent/Difficulty";
import {enterState} from "@gunsmith/engine/opponent/state/EnterState";
import {routeWaypoint} from "@gunsmith/engine/opponent/steering/RouteWaypoint";
import {walkToward} from "@gunsmith/engine/opponent/steering/WalkToward";
import type {OpponentBrain} from "@gunsmith/engine/opponent/types/OpponentBrain";
import type {OpponentContext} from "@gunsmith/engine/opponent/types/OpponentContext";
import type {StateAct} from "@gunsmith/engine/opponent/types/StateAct";

/**
 * Searching: the player is out of sight, so it walks to where it last saw them (by a stair, if they were on another level), looking where it goes, and waits there
 * for `searchLingerSeconds` before it gives up and wanders again. With nowhere to search it gives up at once. It does not
 * fire and does not reload; seeing the player again is `chooseState`'s business.
 */
export function actSearch(brain: OpponentBrain, context: OpponentContext): StateAct {
  const {goal} = brain;
  if (!goal) {
    return giveUp(brain);
  }

  const {opponent, seconds} = context;
  const waypoint = routeWaypoint(context.arena, opponent.position, goal);
  const direction = walkToward(opponent.position, waypoint);
  if (direction.x !== 0 || direction.y !== 0) {
    return {input: {direction, aimAt: waypoint, firing: false, reload: false}, brain};
  }

  const idleSeconds = brain.idleSeconds + seconds;
  if (idleSeconds >= DIFFICULTY.searchLingerSeconds) {
    return giveUp(brain);
  }

  return {input: {direction, aimAt: waypoint, firing: false, reload: false}, brain: {...brain, idleSeconds}};
}

function giveUp(brain: OpponentBrain): StateAct {
  return {
    input: {direction: {x: 0, y: 0}, firing: false, reload: false},
    brain: enterState(brain, "wander"),
  };
}
