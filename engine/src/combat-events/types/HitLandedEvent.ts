import type {HitTarget} from "@gunsmith/engine/bullet/types/HitTarget";

/**
 * One of the local player's bullets landed on a target the player could see as it landed. A target out of sight reports
 * nothing, and the event carries no place, so nothing about where a target stands leaves through it.
 */
export interface HitLandedEvent {
  kind: "hitLanded";
  on: HitTarget;
}
