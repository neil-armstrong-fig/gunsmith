import type {Pickup} from "@gunsmith/engine/pickup/types/Pickup";
import type {Fighters} from "@gunsmith/engine/pickup/types/Fighters";
import type {PickupTaking} from "@gunsmith/engine/pickup/types/PickupTaking";
import {PICKUP_REACH} from "@gunsmith/engine/pickup/taking/PickupReach";
import {withPickedUpWeapon} from "@gunsmith/engine/pickup/taking/WithPickedUpWeapon";
import type {Player} from "@gunsmith/engine/player/types/Player";

/**
 * Who, if anyone, takes the pickup this step: a fighter with health left whose centre is within `PICKUP_REACH` of it, by the
 * same rule for the player and the opponent. When both are in reach the nearer takes it, and an exact tie is the opponent's,
 * as a simultaneous kill is. The taker holds its weapon (`withPickedUpWeapon`) and nothing is left lying. With nothing lying,
 * or nobody in reach, everything comes back as it was.
 */
export function takePickup(pickup: Pickup | undefined, fighters: Fighters): PickupTaking {
  const {player, opponent} = fighters;
  if (!pickup) {
    return {pickup, player, opponent};
  }

  const playerDistance = distanceInReach(player, pickup);
  const opponentDistance = opponent && distanceInReach(opponent, pickup);
  if (playerDistance === undefined && opponentDistance === undefined) {
    return {pickup, player, opponent};
  }

  if (
    opponent &&
    opponentDistance !== undefined &&
    (playerDistance === undefined || opponentDistance <= playerDistance)
  ) {
    return {pickup: undefined, player, opponent: withPickedUpWeapon(opponent, pickup.weapon)};
  }

  return {pickup: undefined, player: withPickedUpWeapon(player, pickup.weapon), opponent};
}

/** How far the fighter is from the pickup, or `undefined` when they have no health left or are out of reach. */
function distanceInReach(fighter: Player, pickup: Pickup): number | undefined {
  if (fighter.health <= 0) {
    return undefined;
  }

  const distance = Math.hypot(fighter.position.x - pickup.position.x, fighter.position.y - pickup.position.y);
  if (distance > PICKUP_REACH) {
    return undefined;
  }

  return distance;
}
