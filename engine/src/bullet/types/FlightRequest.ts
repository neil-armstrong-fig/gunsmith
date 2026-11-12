import type {Bullet} from "@gunsmith/engine/bullet/types/Bullet";
import type {Dummy} from "@gunsmith/engine/dummy/types/Dummy";
import type {Point} from "@gunsmith/engine/geometry/types/Point";

/**
 * What `advanceBullets` is asked to do: fly these bullets on for this long, past these dummies and these fighters. A
 * fighter's position is absent when there is nobody there to be hit.
 */
export interface FlightRequest {
  bullets: readonly Bullet[];
  dummies: readonly Dummy[];
  /** Where the player stands: the opponent's bullets can hurt them. */
  playerPosition?: Point | undefined;
  /** Where the opponent stands: the player's bullets can hurt them. */
  opponentPosition?: Point | undefined;
  seconds: number;
}
