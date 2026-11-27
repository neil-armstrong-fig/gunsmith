import {BUILT_IN_WEAPONS} from "@gunsmith/engine/built-in-weapons/BuiltInWeapons";
import type {ShownWeapon} from "@src/game/room-pre-round/types/ShownWeapon";

/** What a weapon the server showed is called on the screen: a built-in by the name the page's own list gives its key, a saved one by the name it was sent with. */
export function nameOfShownWeapon(weapon: ShownWeapon): string {
  if (weapon.kind === "saved") {
    return weapon.name;
  }

  return BUILT_IN_WEAPONS.find(builtIn => builtIn.identity?.key === weapon.key)?.identity?.name ?? "Weapon";
}
