import type {Weapon} from "@gunsmith/engine/weapon/types/Weapon";

/**
 * The weapon that lies in the arena as a pickup: quick and light, so about as much damage a second as the rifle but in many
 * small hits, with a big magazine and a wide, short cone. Neither fighter starts with it. Every number is a tunable, to be
 * set by play.
 */
export const SUBMACHINE_GUN: Weapon = {
  fireIntervalSeconds: 0.1,
  bulletDamage: 12,
  bulletSpeed: 18,
  magazineSize: 30,
  reloadSeconds: 1.8,
  startingReserve: 60,
  visionDegrees: 110,
  visionRange: 9,
};
