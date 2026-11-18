import type {Weapon} from "@gunsmith/engine/weapon/types/Weapon";

/** The weapon in slot 2: slow and heavy, so two hits to take down a dummy, with a short magazine and a long reload. */
export const MARKSMAN_RIFLE: Weapon = {
  identity: {key: "marksman-rifle", name: "Marksman rifle"},
  fireIntervalSeconds: 0.6,
  bulletDamage: 50,
  bulletSpeed: 30,
  magazineSize: 5,
  reloadSeconds: 2.2,
  startingReserve: 15,
  visionDegrees: 90,
  visionRange: 16,
};
