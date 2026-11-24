import type {Weapon} from "@gunsmith/engine/weapon/types/Weapon";

/** What the reveal shows: the arena the match is played in and the weapons each side carries, slot 1 then slot 2, ready to draw. */
export interface RevealReadout {
  arenaName: string;
  arenaRows: readonly string[];
  own: readonly [Weapon, Weapon];
  opponent: readonly [Weapon, Weapon];
}
