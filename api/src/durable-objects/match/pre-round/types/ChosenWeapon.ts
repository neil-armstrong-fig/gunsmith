import type {Weapon} from "@gunsmith/engine/weapon/types/Weapon";
import type {Appearance} from "@gunsmith/shared/appearance/schema/Appearance";

/**
 * A weapon a seat has put forward, as the room holds it: a built-in by key, or one of the seat's own saved weapons with its id (the
 * room's own, never sent to a page) and the weapon and drawing the room already checked.
 */
export type ChosenWeapon =
  {kind: "builtIn"; key: string} | {kind: "saved"; id: string; weapon: Weapon; appearance: Appearance};
