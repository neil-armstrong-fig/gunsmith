import type {WeaponDraft} from "@gunsmith/ai/pipeline/weapon/WeaponDraft";

/** A weapon that parses and is within the caps: 24 damage every 0.2 seconds is 120 damage per second. */
export const PASSING_WEAPON: WeaponDraft = {
  name: "Proof Rifle",
  bulletDamage: 24,
  fireIntervalSeconds: 0.2,
  bulletSpeed: 20,
  magazineSize: 12,
  reloadSeconds: 1.5,
  startingReserve: 36,
};
