import {MARKSMAN_RIFLE} from "@gunsmith/engine/weapon/weapons/MarksmanRifle";
import {RIFLE} from "@gunsmith/engine/weapon/weapons/Rifle";
import {SUBMACHINE_GUN} from "@gunsmith/engine/weapon/weapons/SubmachineGun";
import type {Weapon} from "@gunsmith/engine/weapon/types/Weapon";

/**
 * Every weapon a player may take into a match without making one, in the order a pre-round lists them. Each is picked by its
 * `identity.key`, never by a body, so the room and the page agree on a weapon by name. `built-in-weapons/BuiltInWeapons.test.ts`
 * holds every entry to a key and name of its own and to the stat ranges a made weapon is held to.
 */
export const BUILT_IN_WEAPONS: readonly Weapon[] = [RIFLE, MARKSMAN_RIFLE, SUBMACHINE_GUN];
