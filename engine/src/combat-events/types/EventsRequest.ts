import type {DamageToPlayer} from "@gunsmith/engine/combat-events/types/DamageToPlayer";
import type {FighterTurn} from "@gunsmith/engine/game-loop/fighter/types/FighterTurn";

/** What `eventsOfStep` is told about one step: only the local player's side of it, since an event is never about the opponent. */
export interface EventsRequest {
  /** The player's own turn: the opponent's is deliberately not here. */
  playerTurn: FighterTurn;
  /** What the step meant to take off the player, by cause. */
  damage: DamageToPlayer;
}
