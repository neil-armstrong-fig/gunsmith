import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import {fireBullet} from "@gunsmith/engine/bullet/FireBullet";
import type {Shooter} from "@gunsmith/engine/bullet/types/Shooter";
import type {FighterShot} from "@gunsmith/engine/game-loop/fighter/types/FighterShot";
import type {FighterTurn} from "@gunsmith/engine/game-loop/fighter/types/FighterTurn";
import {eyeLevelAt} from "@gunsmith/engine/height/EyeLevelAt";
import {equippedWeapon} from "@gunsmith/engine/loadout/EquippedWeapon";
import {spendRound} from "@gunsmith/engine/weapon/SpendRound";

/**
 * Lets the shot go if the turn's trigger fired: a bullet leaves the muzzle with the damage and speed of the weapon in
 * hand, marked as `shooter`'s and at the level of their eye, and the fighter is a round lighter. Otherwise nothing changes.
 */
export function shootFighter(arena: Arena, shooter: Shooter, turn: FighterTurn): FighterShot {
  const {fighter, fires} = turn;
  if (!fires) {
    return {fighter};
  }

  const {weapon} = equippedWeapon(fighter);

  return {
    fighter: spendRound(fighter),
    bullet: fireBullet(shooter, {
      from: fighter.position,
      aim: fighter.aim,
      weapon,
      level: eyeLevelAt(arena, fighter.position),
    }),
  };
}
