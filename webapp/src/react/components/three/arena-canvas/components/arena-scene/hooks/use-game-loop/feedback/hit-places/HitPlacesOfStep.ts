import type {Point} from "@gunsmith/engine/geometry/types/Point";
import {hurtDummiesInSight} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-game-loop/feedback/hit-places/hurt-dummies/HurtDummiesInSight";
import type {StepReport} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-game-loop/feedback/types/StepReport";

/**
 * Where to mark the targets the player's bullets hit in one step. The engine reports a hit only on a target the player saw, and gives no place (it would give
 * a hidden one away), so the place is found here: the opponent where it stands after the step, and each dummy in sight that lost health, where it stood.
 * One place for a target however many bullets landed on it. Nothing for a step that reports no hit, however much health a hidden target lost.
 */
export function hitPlacesOfStep(report: StepReport): Point[] {
  const hits = report.after.events?.filter(event => event.kind === "hitLanded") ?? [];
  if (hits.length === 0) {
    return [];
  }

  const places: Point[] = [];
  const {opponent} = report.after;
  if (opponent && hits.some(hit => hit.on === "opponent")) {
    places.push(opponent.position);
  }

  if (hits.some(hit => hit.on === "dummy")) {
    places.push(...hurtDummiesInSight(report));
  }

  return places;
}
