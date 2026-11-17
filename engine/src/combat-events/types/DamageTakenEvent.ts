import type {DamageCause} from "@gunsmith/engine/combat-events/types/DamageCause";

/** The local player lost health, and what from. `amount` is the health actually lost, so a hit on a player with 3 left says 3. */
export interface DamageTakenEvent {
  kind: "damageTaken";
  cause: DamageCause;
  amount: number;
}
