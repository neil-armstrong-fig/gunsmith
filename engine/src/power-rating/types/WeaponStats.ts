import type {Weapon} from "@gunsmith/engine/weapon/types/Weapon";

/** The six numbers that make one weapon stronger or weaker than another: a `Weapon` without its vision. */
export type WeaponStats = Pick<
  Weapon,
  "bulletDamage" | "fireIntervalSeconds" | "bulletSpeed" | "magazineSize" | "reloadSeconds" | "startingReserve"
>;
