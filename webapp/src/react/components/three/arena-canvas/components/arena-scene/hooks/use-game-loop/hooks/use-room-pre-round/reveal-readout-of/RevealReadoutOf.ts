import {BUILT_IN_WEAPONS} from "@gunsmith/engine/weapon/built-in/BuiltInWeapons";
import type {Weapon} from "@gunsmith/engine/weapon/types/Weapon";
import type {RevealReadout} from "@src/game/room-pre-round/types/RevealReadout";
import type {RevealFrame} from "@src/online/types/RevealFrame";
import type {RevealedWeapon} from "@src/online/types/RevealedWeapon";

/** What the reveal shows, from the server's frame: each weapon as a real weapon, a built-in from the page's own list and a saved one from the frame. Nothing if the server has said nothing or names a built-in this page does not have. */
export function revealReadoutOf(frame: RevealFrame | undefined): RevealReadout | undefined {
  if (!frame) {
    return undefined;
  }

  const own = pairOf(frame.weapons.own);
  const opponent = pairOf(frame.weapons.opponent);
  if (!own || !opponent) {
    return undefined;
  }

  return {arenaName: frame.arena.name, arenaRows: frame.arena.rows, own, opponent};
}

function pairOf(weapons: readonly [RevealedWeapon, RevealedWeapon]): readonly [Weapon, Weapon] | undefined {
  const first = weaponOf(weapons[0]);
  const second = weaponOf(weapons[1]);
  if (!first || !second) {
    return undefined;
  }

  return [first, second];
}

function weaponOf(revealed: RevealedWeapon): Weapon | undefined {
  if (revealed.kind === "saved") {
    return revealed.weapon;
  }

  return BUILT_IN_WEAPONS.find(weapon => weapon.identity?.key === revealed.key);
}
