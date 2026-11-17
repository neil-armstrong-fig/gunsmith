import type {DamageCause} from "@gunsmith/engine/combat-events/types/DamageCause";

/**
 * The local player lost health in this step. `amount` is the health they really lost, not the damage dealt: a bullet that
 * hits a player with 3 health left says 3. There is at most one per cause per step, so bullets landing together are one
 * loss, and none for a cause that took nothing. It names no attacker and no place.
 */
export interface DamageTakenEvent {
  kind: "damageTaken";
  cause: DamageCause;
  amount: number;
}
