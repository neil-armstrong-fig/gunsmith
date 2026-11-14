import {equippedWeapon} from "@gunsmith/engine/loadout/EquippedWeapon";
import type {Player} from "@gunsmith/engine/player/types/Player";
import {CROUCH_RANGE_FACTOR} from "@gunsmith/engine/vision/cone/CrouchRangeFactor";
import type {Cone} from "@gunsmith/engine/vision/types/Cone";

const RADIANS_PER_DEGREE = Math.PI / 180;

/** The cone a fighter sees through: from where they stand, along their aim, as wide and as far as the weapon in hand allows. */
export function coneOf(fighter: Player): Cone {
  const {weapon} = equippedWeapon(fighter);

  return {
    apex: fighter.position,
    aim: fighter.aim,
    halfAngleRadians: (weapon.visionDegrees / 2) * RADIANS_PER_DEGREE,
    range: rangeOf(fighter, weapon.visionRange),
  };
}

function rangeOf(fighter: Player, standingRange: number): number {
  if (fighter.crouching) {
    return standingRange * CROUCH_RANGE_FACTOR;
  }

  return standingRange;
}
