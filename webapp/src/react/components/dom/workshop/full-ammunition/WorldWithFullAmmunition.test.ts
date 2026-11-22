import {startingWorld} from "@gunsmith/engine/game-loop/StartingWorld";
import type {World} from "@gunsmith/engine/game-loop/types/World";
import type {CarriedWeapon} from "@gunsmith/engine/loadout/types/CarriedWeapon";
import {SUBMACHINE_GUN} from "@gunsmith/engine/weapon/weapons/SubmachineGun";
import {PRACTICE_ARENA} from "@src/game/practice/PracticeArena";
import {PRACTICE_DUMMIES} from "@src/game/practice/PracticeDummies";
import {worldWithFullAmmunition} from "@src/react/components/dom/workshop/full-ammunition/WorldWithFullAmmunition";
import {expect, it} from "vitest";

it("fills the magazine and the reserve of the weapon in hand", () => {
  const [first] = worldWithFullAmmunition(spentWorld()).player.loadout;

  expect(first?.rounds).toBe(first?.weapon.magazineSize);
  expect(first?.reserve).toBe(first?.weapon.startingReserve);
});

it("fills the weapon on the player's back too", () => {
  const [, second] = worldWithFullAmmunition(spentWorld()).player.loadout;

  expect(second?.rounds).toBe(second?.weapon.magazineSize);
  expect(second?.reserve).toBe(second?.weapon.startingReserve);
});

it("fills a weapon the player made by its own sizes, not another weapon's", () => {
  const spent = spentWorld();
  const made: CarriedWeapon = {weapon: SUBMACHINE_GUN, rounds: 0, reserve: 0};
  const withMadeWeapon = {...spent, player: {...spent.player, loadout: [...spent.player.loadout.slice(0, 1), made]}};

  const [, second] = worldWithFullAmmunition(withMadeWeapon).player.loadout;

  expect(second?.rounds).toBe(SUBMACHINE_GUN.magazineSize);
  expect(second?.reserve).toBe(SUBMACHINE_GUN.startingReserve);
});

it("keeps each weapon where it was, and the one in hand in hand", () => {
  const spent = spentWorld();

  const after = worldWithFullAmmunition(spent).player;

  expect(after.loadout.map(carried => carried.weapon)).toEqual(spent.player.loadout.map(carried => carried.weapon));
  expect(after.equippedIndex).toBe(spent.player.equippedIndex);
});

it("ends a reload that was going on, as the magazine it was filling is full", () => {
  const spent = spentWorld();
  const reloading = {...spent, player: {...spent.player, reloadRemainingSeconds: 0.7}};

  expect(worldWithFullAmmunition(reloading).player.reloadRemainingSeconds).toBeUndefined();
});

it("changes nothing else in the world", () => {
  const spent = spentWorld();

  const after = worldWithFullAmmunition(spent);

  expect({...after, player: undefined}).toEqual({...spent, player: undefined});
  expect({...after.player, loadout: undefined}).toEqual({...spent.player, loadout: undefined});
});

function spentWorld(): World {
  const world = startingWorld(PRACTICE_ARENA, PRACTICE_DUMMIES);
  const loadout = world.player.loadout.map(carried => ({...carried, rounds: 1, reserve: 0}));

  return {...world, player: {...world.player, loadout, equippedIndex: 1}};
}
