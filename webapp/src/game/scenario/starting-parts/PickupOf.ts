import type {World} from "@gunsmith/engine/game-loop/types/World";
import {startPickup} from "@gunsmith/engine/pickup/StartPickup";
import type {Pickup} from "@gunsmith/engine/pickup/types/Pickup";
import {SUBMACHINE_GUN} from "@gunsmith/engine/weapon/weapons/SubmachineGun";

/** The weapon lying in the arena for a world that has an opponent: as far from one fighter as the other by the way they would walk, drawn from `seed`. */
export function pickupOf(world: World, seed: number): Pickup {
  const starts = [world.player.position];
  if (world.opponent) {
    starts.push(world.opponent.position);
  }

  return startPickup({arena: world.arena, starts, seed, weapon: SUBMACHINE_GUN});
}
