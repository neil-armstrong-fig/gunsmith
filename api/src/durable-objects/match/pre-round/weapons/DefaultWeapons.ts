import type {ChosenWeapon} from "@src/durable-objects/match/pre-round/types/ChosenWeapon";
import type {WeaponSlot} from "@src/durable-objects/match/pre-round/types/WeaponSlot";

/** What a seat carries in each slot when it locks in without choosing, or runs out of time: the rifle in slot 1 and the marksman rifle in slot 2, as the engine's starting loadout has them. */
export const DEFAULT_WEAPONS: Record<WeaponSlot, ChosenWeapon> = {
  1: {kind: "builtIn", key: "rifle"},
  2: {kind: "builtIn", key: "marksman-rifle"},
};
