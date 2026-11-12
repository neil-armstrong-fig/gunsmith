import type {Player} from "@gunsmith/engine/player/types/Player";
import {spendRound} from "@gunsmith/engine/weapon/SpendRound";
import type {Weapon} from "@gunsmith/engine/weapon/types/Weapon";

const WEAPON: Weapon = {
  fireIntervalSeconds: 0.2,
  bulletDamage: 25,
  bulletSpeed: 20,
  magazineSize: 10,
  reloadSeconds: 1,
  startingReserve: 30,
};

function playerHolding(equippedIndex: number): Player {
  return {
    position: {x: 1.5, y: 1.5},
    aim: {x: 1, y: 0},
    cooldownSeconds: 0,
    loadout: [
      {weapon: WEAPON, rounds: 3, reserve: 30},
      {weapon: WEAPON, rounds: 7, reserve: 12},
    ],
    equippedIndex,
  };
}

it("takes one round out of the magazine of the first weapon when it is the one equipped", () => {
  expect(spendRound(playerHolding(0)).loadout[0]).toEqual({weapon: WEAPON, rounds: 2, reserve: 30});
});

it("takes one round out of the magazine of the second weapon when it is the one equipped", () => {
  expect(spendRound(playerHolding(1)).loadout[1]).toEqual({weapon: WEAPON, rounds: 6, reserve: 12});
});

it("leaves the weapon that is not equipped alone", () => {
  expect(spendRound(playerHolding(1)).loadout[0]).toEqual({weapon: WEAPON, rounds: 3, reserve: 30});
  expect(spendRound(playerHolding(0)).loadout[1]).toEqual({weapon: WEAPON, rounds: 7, reserve: 12});
});

it("leaves the rest of the player alone", () => {
  const player = playerHolding(0);

  expect({...spendRound(player), loadout: []}).toEqual({...player, loadout: []});
});

it("does not change the player it was given", () => {
  const player = playerHolding(0);
  const before = structuredClone(player);

  spendRound(player);

  expect(player).toEqual(before);
});
