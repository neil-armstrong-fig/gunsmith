import type {WantedWeapon} from "@src/game/online-pre-round/types/WantedWeapon";
import type {ShelfWeapon} from "@src/store/shelf/types/ShelfWeapon";

/**
 * What the room is to be told for the weapon the player chose: one of their saved weapons by its library id when the choice is one of them, else
 * a built-in by its key. A saved weapon is never sent by its name or its body, since the server finds the id among that account's saved items.
 */
export function wantedWeaponOf(chosenId: string, savedWeapons: readonly ShelfWeapon[]): WantedWeapon {
  if (savedWeapons.some(saved => saved.id === chosenId)) {
    return {kind: "saved", id: chosenId};
  }

  return {kind: "builtIn", key: chosenId};
}
