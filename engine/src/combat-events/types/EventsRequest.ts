import type {HitTarget} from "@gunsmith/engine/bullet/types/HitTarget";
import type {HeardEvent} from "@gunsmith/engine/combat-events/types/HeardEvent";
import type {DamageToPlayer} from "@gunsmith/engine/combat-events/types/DamageToPlayer";
import type {FighterTurn} from "@gunsmith/engine/game-loop/fighter/types/FighterTurn";

/** What `eventsOfStep` is told about one step: only the local player's side of it, since an event is never about the opponent. */
export interface EventsRequest {
  /** The player's own turn: the opponent's is deliberately not here. */
  playerTurn: FighterTurn;
  /** What the step meant to take off the player, by cause. */
  damage: DamageToPlayer;
  /** What the player's bullets landed on in this step, only where the player could see it: a hidden target is not here. */
  visibleHits: readonly HitTarget[];
  playerTookPickup: boolean;
  /** What the player heard of the other fighter this step (`heardInStep`): a shot, a footfall, a weapon taken, each within its own range. */
  heard: readonly HeardEvent[];
}
