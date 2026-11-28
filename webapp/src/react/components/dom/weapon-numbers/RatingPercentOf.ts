import {powerRatingOf} from "@gunsmith/engine/weapon/power-rating/PowerRatingOf";
import type {Weapon} from "@gunsmith/engine/weapon/types/Weapon";

/** A weapon's power rating as the screen prints it: a whole number from 0 to 100. */
export function ratingPercentOf(weapon: Weapon): number {
  return Math.round(powerRatingOf(weapon) * 100);
}
