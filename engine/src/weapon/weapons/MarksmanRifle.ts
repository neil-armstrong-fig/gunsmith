import type {Weapon} from "@gunsmith/engine/weapon/types/Weapon";

/** The weapon in slot 2: slow and heavy, so two hits to take down a dummy, with a short magazine and a long reload. */
export const MARKSMAN_RIFLE: Weapon = {
  fireIntervalSeconds: 0.6,
  bulletDamage: 50,
  bulletSpeed: 30,
  magazineSize: 5,
  reloadSeconds: 2.2,
  startingReserve: 15,
};
