import type {Weapon} from "@gunsmith/engine/weapon/types/Weapon";

/**
 * A weapon as the server lets this page know it while choosing: a built-in by key (the page has it), a saved one by its name, and the other
 * player's saved one with its numbers (`weapon`, already given its drawing) once the server has told them, which it does once, when both have
 * locked in that slot.
 */
export type ShownWeapon = {kind: "builtIn"; key: string} | {kind: "saved"; name: string; weapon?: Weapon};
