import type {ChosenWeapon} from "@src/durable-objects/match/pre-round/types/ChosenWeapon";
import type {WeaponView} from "@src/durable-objects/match/pre-round/types/WeaponView";

/** How a seat is shown a weapon: a built-in by key, a saved one by its name. Never an id, a number or a drawing. */
export function weaponViewOf(choice: ChosenWeapon): WeaponView {
  if (choice.kind === "builtIn") {
    return {kind: "builtIn", key: choice.key};
  }

  return {kind: "saved", name: choice.weapon.identity?.name ?? "Saved weapon"};
}
