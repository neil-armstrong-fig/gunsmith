import type {WeaponChoice} from "@src/durable-objects/match/messages/types/WeaponChoice";

/** A seat puts two weapons forward (slot 1, slot 2), each a built-in by key or a saved one by id, not yet locked in. */
export interface ChooseWeaponsAction {
  kind: "chooseWeapons";
  choices: readonly [WeaponChoice, WeaponChoice];
}
