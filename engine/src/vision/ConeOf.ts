import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import {eyeLevelAt} from "@gunsmith/engine/height/EyeLevelAt";
import {equippedWeapon} from "@gunsmith/engine/loadout/EquippedWeapon";
import type {Player} from "@gunsmith/engine/player/types/Player";
import {CROUCH_RANGE_FACTOR} from "@gunsmith/engine/vision/cone/CrouchRangeFactor";
import type {Cone} from "@gunsmith/engine/vision/types/Cone";

const RADIANS_PER_DEGREE = Math.PI / 180;

/** The cone a fighter sees through: from where they stand and the level they stand on, along their aim, as wide and as far as the weapon in hand allows. */
export function coneOf(arena: Arena, fighter: Player): Cone {
  const {weapon} = equippedWeapon(fighter);

  return {
    apex: fighter.position,
    aim: fighter.aim,
    halfAngleRadians: (weapon.visionDegrees / 2) * RADIANS_PER_DEGREE,
    range: rangeOf(fighter, weapon.visionRange),
    eyeLevel: eyeLevelAt(arena, fighter.position),
    crouching: fighter.crouching,
  };
}

function rangeOf(fighter: Player, standingRange: number): number {
  if (fighter.crouching) {
    return standingRange * CROUCH_RANGE_FACTOR;
  }

  return standingRange;
}
