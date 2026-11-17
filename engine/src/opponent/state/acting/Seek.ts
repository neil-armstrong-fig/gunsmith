import {routeWaypoint} from "@gunsmith/engine/opponent/steering/RouteWaypoint";
import {walkToward} from "@gunsmith/engine/opponent/steering/WalkToward";
import type {OpponentBrain} from "@gunsmith/engine/opponent/types/OpponentBrain";
import type {OpponentContext} from "@gunsmith/engine/opponent/types/OpponentContext";
import type {StateAct} from "@gunsmith/engine/opponent/types/StateAct";

/**
 * Seeking: walk to the weapon lying in the arena (by a stair, if it lies on another level), aiming where it walks. It
 * does not fire and does not reload, which is why it only sets out when it will win the walk (`winningTheRace`). The weapon is
 * the world's, not the brain's, so there is no goal to remember: standing within the arrival radius of it is standing within
 * reach, and `step` hands it over. With no weapon there it stands still until `chooseState` has chosen something else.
 */
export function actSeek(brain: OpponentBrain, context: OpponentContext): StateAct {
  const {pickup, opponent} = context;
  if (!pickup) {
    return {input: {direction: {x: 0, y: 0}, firing: false, reload: false}, brain};
  }

  const waypoint = routeWaypoint(context.arena, opponent.position, pickup.position);

  return {
    input: {direction: walkToward(opponent.position, waypoint), aimAt: waypoint, firing: false, reload: false},
    brain,
  };
}
