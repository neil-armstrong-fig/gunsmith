import type {Player} from "@gunsmith/engine/player/types/Player";
import {switchWeapon} from "@gunsmith/engine/loadout/SwitchWeapon";
import type {Weapon} from "@gunsmith/engine/weapon/types/Weapon";

const WEAPON: Weapon = {
  fireIntervalSeconds: 0.2,
  bulletDamage: 25,
  bulletSpeed: 20,
  magazineSize: 10,
  reloadSeconds: 1,
  startingReserve: 30,
};

/** A player carrying two weapons with different rounds left, holding slot `equippedSlot`. */
function playerHolding(equippedSlot: number, reloadRemainingSeconds?: number): Player {
  return {
    position: {x: 1.5, y: 1.5},
    aim: {x: 1, y: 0},
    cooldownSeconds: 0,
    loadout: [
      {weapon: WEAPON, rounds: 3, reserve: 30},
      {weapon: WEAPON, rounds: 7, reserve: 12},
    ],
    equippedIndex: equippedSlot - 1,
    health: 100,
    reloadRemainingSeconds,
  };
}

it("equips the second weapon when slot 2 is asked for", () => {
  expect(switchWeapon(playerHolding(1), 2).equippedIndex).toBe(1);
});

it("equips the first weapon when slot 1 is asked for", () => {
  expect(switchWeapon(playerHolding(2), 1).equippedIndex).toBe(0);
});

it("cancels a reload in progress", () => {
  expect(switchWeapon(playerHolding(1, 0.7), 2).reloadRemainingSeconds).toBeUndefined();
});

it("leaves the rounds in both weapons as they were", () => {
  const player = playerHolding(1, 0.7);

  expect(switchWeapon(player, 2).loadout).toEqual(player.loadout);
});

it("does nothing when the equipped slot is asked for again, and a reload carries on", () => {
  const player = playerHolding(2, 0.7);

  expect(switchWeapon(player, 2)).toEqual(player);
});

it("does nothing when no slot is asked for", () => {
  const player = playerHolding(1, 0.7);

  expect(switchWeapon(player, undefined)).toEqual(player);
});

it.each([0, 3, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY])(
  "ignores slot %s, which is not one the player carries",
  slot => {
    const player = playerHolding(1, 0.7);

    expect(switchWeapon(player, slot)).toEqual(player);
  },
);

it("does not change the player it was given", () => {
  const player = playerHolding(1, 0.7);
  const before = structuredClone(player);

  switchWeapon(player, 2);

  expect(player).toEqual(before);
});
