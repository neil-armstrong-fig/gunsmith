import type {ChosenWeapons} from "@src/durable-objects/match/pre-round/types/ChosenWeapons";
import type {WeaponView} from "@src/durable-objects/match/pre-round/types/WeaponView";

/** How a seat is shown a pair of weapons: a built-in by key, a saved one by its name. Never an id, a number or a drawing. */
export function weaponViewsOf(chosen: ChosenWeapons): readonly [WeaponView, WeaponView] {
  return [weaponViewOf(chosen[0]), weaponViewOf(chosen[1])];
}

function weaponViewOf(choice: ChosenWeapons[number]): WeaponView {
  if (choice.kind === "builtIn") {
    return {kind: "builtIn", key: choice.key};
  }

  return {kind: "saved", name: choice.weapon.identity?.name ?? "Saved weapon"};
}
