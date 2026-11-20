import type {WeaponKeys} from "@src/durable-objects/match/pre-round/types/WeaponKeys";

/** What a seat carries when it locks in without choosing, or runs out of time: the rifle in slot 1 and the marksman rifle in slot 2, as the engine's starting loadout has them. */
export const DEFAULT_WEAPON_KEYS: WeaponKeys = ["rifle", "marksman-rifle"];
