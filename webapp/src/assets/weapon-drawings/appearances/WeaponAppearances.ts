import type {Weapon} from "@gunsmith/engine/weapon/types/Weapon";
import type {Appearance} from "@gunsmith/shared/appearance/schema/Appearance";

/** Workshop artwork follows the weapon instance. Every account weapon can share the same engine identity key. */
export const weaponAppearances = new WeakMap<Weapon, Appearance>();
