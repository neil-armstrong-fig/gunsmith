import type {Point} from "@gunsmith/engine/geometry/types/Point";
import {DIFFICULTY} from "@gunsmith/engine/opponent/Difficulty";
import {waypointToward} from "@gunsmith/engine/opponent/shelter/waypoint/WaypointToward";
import {routeWaypoint} from "@gunsmith/engine/opponent/steering/RouteWaypoint";
import {walkToward} from "@gunsmith/engine/opponent/steering/WalkToward";
import type {OpponentContext} from "@gunsmith/engine/opponent/types/OpponentContext";
import type {StateAct} from "@gunsmith/engine/opponent/types/StateAct";
import {closingProgress} from "@gunsmith/engine/ring/ClosingProgress";
import {radiusOfRing} from "@gunsmith/engine/ring/RadiusOfRing";

/**
 * Keeps the opponent inside the closing ring. Once the ring has started to close, an opponent nearer the edge than
 * `ringMargin` (or beyond it) walks to the ring's centre (round a wall if one is in the way) instead of where its state sent it, so the edge never catches it.
 * It still fires, reloads and keeps its aim on the player while it sees them; when it does not, it looks where it walks. Before the
 * ring closes, or in a round with no ring, the state's act is returned as it came. The state's brain is never touched.
 */
export function shelterFromRing(act: StateAct, context: OpponentContext): StateAct {
  const {ring, opponent, sees} = context;
  if (!ring || closingProgress(ring) === 0) {
    return act;
  }

  const fromCentre = Math.hypot(opponent.position.x - ring.centre.x, opponent.position.y - ring.centre.y);
  if (fromCentre <= radiusOfRing(ring) - DIFFICULTY.ringMargin) {
    return act;
  }

  const waypoint = waypointOf(context, ring.centre);
  const direction = walkToward(opponent.position, waypoint);

  if (sees) {
    return {...act, input: {...act.input, direction}};
  }

  return {...act, input: {...act.input, direction, aimAt: waypoint}};
}

/** By the stair when the way to the centre needs one, and otherwise as it has always gone: straight, or round a pillar. */
function waypointOf(context: OpponentContext, centre: Point): Point {
  const routed = routeWaypoint(context.arena, context.opponent.position, centre);
  if (routed.x !== centre.x || routed.y !== centre.y) {
    return routed;
  }

  return waypointToward(context.arena, context.opponent.position, centre);
}
