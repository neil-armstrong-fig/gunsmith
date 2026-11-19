import type {Weapon} from "@gunsmith/engine/weapon/types/Weapon";
import {MARKSMAN_RIFLE} from "@gunsmith/engine/weapon/weapons/MarksmanRifle";
import {RIFLE} from "@gunsmith/engine/weapon/weapons/Rifle";
import {SUBMACHINE_GUN} from "@gunsmith/engine/weapon/weapons/SubmachineGun";

const LONG_RANGE_WORDS = /sniper|marksman|long|scope/i;
const FAST_WORDS = /fast|rapid|submachine|smg|spray/i;

/**
 * What the workshop makes until the real route answers: a built-in weapon chosen by the words in the prompt (a long-range one, a fast one, else the rifle),
 * named as a stand-in so nobody mistakes it for a generated weapon. It has the built-in's identity, so it is drawn with that weapon's picture.
 */
export function standInWeaponFor(prompt: string): Weapon {
  const base = baseWeaponFor(prompt);

  return {...base, identity: {key: base.identity?.key ?? "rifle", name: `Stand-in ${base.identity?.name ?? "rifle"}`}};
}

function baseWeaponFor(prompt: string): Weapon {
  if (LONG_RANGE_WORDS.test(prompt)) {
    return MARKSMAN_RIFLE;
  }

  if (FAST_WORDS.test(prompt)) {
    return SUBMACHINE_GUN;
  }

  return RIFLE;
}
