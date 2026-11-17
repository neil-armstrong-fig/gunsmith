import type {Bullet} from "@gunsmith/engine/bullet/types/Bullet";
import type {LandedHit} from "@gunsmith/engine/bullet/types/LandedHit";
import type {Dummy} from "@gunsmith/engine/dummy/types/Dummy";

/**
 * What a step of flying leaves behind: the bullets still in the air, the dummies left standing (hurt or not), and the
 * damage that landed on each fighter this step, for the caller to take off their health.
 */
export interface BulletFlight {
  bullets: Bullet[];
  dummies: Dummy[];
  /** The damage of every opponent's bullet that landed on the player. */
  playerDamage: number;
  /** The damage of every player's bullet that landed on the opponent. */
  opponentDamage: number;
  /** Every player's bullet that landed on the opponent or a dummy, in order, whether or not the player could see it. */
  playerHits: LandedHit[];
}
