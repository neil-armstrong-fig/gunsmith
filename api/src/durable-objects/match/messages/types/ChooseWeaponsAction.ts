import type {WeaponKeys} from "@src/durable-objects/match/pre-round/types/WeaponKeys";

/** A seat puts two built-in weapons forward, by key (slot 1, slot 2), not yet locked in. */
export interface ChooseWeaponsAction {
  kind: "chooseWeapons";
  keys: WeaponKeys;
}
