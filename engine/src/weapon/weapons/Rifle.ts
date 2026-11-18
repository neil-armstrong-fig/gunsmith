import type {Weapon} from "@gunsmith/engine/weapon/types/Weapon";

/** The weapon in slot 1: quick and light, so four hits to take down a dummy. */
export const RIFLE: Weapon = {
  identity: {key: "rifle", name: "Rifle"},
  fireIntervalSeconds: 0.2,
  bulletDamage: 25,
  bulletSpeed: 20,
  magazineSize: 12,
  reloadSeconds: 1.5,
  startingReserve: 36,
  visionDegrees: 90,
  visionRange: 12,
};
