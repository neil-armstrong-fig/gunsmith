import type {Weapon} from "@gunsmith/engine/weapon/types/Weapon";
import type {Appearance} from "@gunsmith/shared/appearance/schema/Appearance";

/** One weapon in the reveal: a built-in by key (the page has it), or a saved one with its numbers and drawing (the other player's page does not). Never an id. */
export type RevealedWeapon = {kind: "builtIn"; key: string} | {kind: "saved"; weapon: Weapon; appearance: Appearance};
