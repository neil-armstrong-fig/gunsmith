import type {Weapon} from "@gunsmith/engine/weapon/types/Weapon";
import type {Appearance} from "@gunsmith/shared/appearance/schema/Appearance";

/** One weapon in the reveal: a built-in by key, or a saved one with its numbers and drawing. Never an id. */
export type RevealedWeapon = {kind: "builtIn"; key: string} | {kind: "saved"; weapon: Weapon; appearance: Appearance};
