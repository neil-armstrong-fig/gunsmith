import type {Player} from "@gunsmith/engine/player/types/Player";
import {reloadWeapon} from "@gunsmith/engine/weapon/ReloadWeapon";
import type {Weapon} from "@gunsmith/engine/weapon/types/Weapon";

const WEAPON: Weapon = {
  fireIntervalSeconds: 0.2,
  bulletDamage: 25,
  bulletSpeed: 20,
  magazineSize: 10,
  reloadSeconds: 1,
  startingReserve: 30,
};

/** A player holding one weapon with `rounds` in the magazine and `reserve` in the bag. */
function playerWith(rounds: number, reserve: number, reloadRemainingSeconds?: number): Player {
  return {
    position: {x: 1.5, y: 1.5},
    aim: {x: 1, y: 0},
    cooldownSeconds: 0,
    loadout: [{weapon: WEAPON, rounds, reserve}],
    equippedIndex: 0,
    reloadRemainingSeconds,
  };
}

it("starts a reload when asked, with the whole reload time still to go", () => {
  const after = reloadWeapon(playerWith(4, 30), true, 0.1);

  expect(after.reloadRemainingSeconds).toBe(WEAPON.reloadSeconds);
});

it("does not put a round in the magazine when the reload only begins", () => {
  expect(reloadWeapon(playerWith(4, 30), true, 0.1).loadout[0]).toEqual({weapon: WEAPON, rounds: 4, reserve: 30});
});

it("does not start a reload when it was not asked for", () => {
  expect(reloadWeapon(playerWith(4, 30), false, 0.1).reloadRemainingSeconds).toBeUndefined();
});

it("does not start a reload when the magazine is already full", () => {
  expect(reloadWeapon(playerWith(10, 30), true, 0.1).reloadRemainingSeconds).toBeUndefined();
});

it("starts a reload when the magazine is one round short", () => {
  expect(reloadWeapon(playerWith(9, 30), true, 0.1).reloadRemainingSeconds).toBe(WEAPON.reloadSeconds);
});

it("does not start a reload when the reserve is empty", () => {
  expect(reloadWeapon(playerWith(4, 0), true, 0.1).reloadRemainingSeconds).toBeUndefined();
});

it("starts a reload when the reserve has a single round", () => {
  expect(reloadWeapon(playerWith(4, 1), true, 0.1).reloadRemainingSeconds).toBe(WEAPON.reloadSeconds);
});

it("counts the reload down by the time that passed, and leaves the magazine alone until it is done", () => {
  const after = reloadWeapon(playerWith(4, 30, 1), false, 0.25);

  expect(after.reloadRemainingSeconds).toBeCloseTo(0.75, 12);
  expect(after.loadout[0]).toEqual({weapon: WEAPON, rounds: 4, reserve: 30});
});

it("does not start the reload over when it is asked for again part of the way through", () => {
  expect(reloadWeapon(playerWith(4, 30, 0.5), true, 0.1).reloadRemainingSeconds).toBeCloseTo(0.4, 12);
});

it("fills the magazine from the reserve on the step the reload finishes", () => {
  const after = reloadWeapon(playerWith(4, 30, 0.01), false, 0.02);

  expect(after.loadout[0]).toEqual({weapon: WEAPON, rounds: 10, reserve: 24});
  expect(after.reloadRemainingSeconds).toBeUndefined();
});

it("finishes the reload on the step the time left is used up exactly", () => {
  const after = reloadWeapon(playerWith(4, 30, 0.5), false, 0.5);

  expect(after.loadout[0]?.rounds).toBe(10);
  expect(after.reloadRemainingSeconds).toBeUndefined();
});

it("does not finish the reload on the step before the time is used up", () => {
  const after = reloadWeapon(playerWith(4, 30, 0.5), false, 0.49);

  expect(after.loadout[0]?.rounds).toBe(4);
  expect(after.reloadRemainingSeconds).toBeCloseTo(0.01, 12);
});

it("puts in only what the reserve holds when that is less than the magazine needs", () => {
  const after = reloadWeapon(playerWith(4, 3, 0.01), false, 0.02);

  expect(after.loadout[0]).toEqual({weapon: WEAPON, rounds: 7, reserve: 0});
});

it("empties the reserve into a magazine that needs exactly what the reserve holds", () => {
  const after = reloadWeapon(playerWith(7, 3, 0.01), false, 0.02);

  expect(after.loadout[0]).toEqual({weapon: WEAPON, rounds: 10, reserve: 0});
});

it("reloads only the weapon that is equipped", () => {
  const other = {weapon: WEAPON, rounds: 2, reserve: 5};
  const player: Player = {
    ...playerWith(4, 30, 0.01),
    loadout: [other, {weapon: WEAPON, rounds: 4, reserve: 30}],
    equippedIndex: 1,
  };
  const after = reloadWeapon(player, false, 0.02);

  expect(after.loadout[0]).toEqual(other);
  expect(after.loadout[1]).toEqual({weapon: WEAPON, rounds: 10, reserve: 24});
});

it("asks the equipped weapon how long its reload takes", () => {
  const slow: Weapon = {...WEAPON, reloadSeconds: 3};
  const player: Player = {...playerWith(4, 30), loadout: [{weapon: slow, rounds: 4, reserve: 30}]};

  expect(reloadWeapon(player, true, 0.1).reloadRemainingSeconds).toBe(3);
});

it("does not change the player it was given", () => {
  const player = playerWith(4, 30, 0.01);
  const before = structuredClone(player);

  reloadWeapon(player, true, 0.02);

  expect(player).toEqual(before);
});
