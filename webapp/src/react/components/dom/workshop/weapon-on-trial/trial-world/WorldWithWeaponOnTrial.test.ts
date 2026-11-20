import {startingWorld} from "@gunsmith/engine/game-loop/StartingWorld";
import type {World} from "@gunsmith/engine/game-loop/types/World";
import {SUBMACHINE_GUN} from "@gunsmith/engine/weapon/weapons/SubmachineGun";
import {PRACTICE_ARENA} from "@src/game/practice/PracticeArena";
import {PRACTICE_DUMMIES} from "@src/game/practice/PracticeDummies";
import {worldWithWeaponOnTrial} from "@src/react/components/dom/workshop/weapon-on-trial/trial-world/WorldWithWeaponOnTrial";
import {expect, it} from "vitest";

const MADE_WEAPON = {...SUBMACHINE_GUN, identity: {key: "submachine-gun", name: "Made by the player"}};

it("puts the weapon in slot 2, keeping the weapon in slot 1", () => {
  const before = practiceWorld();

  const after = worldWithWeaponOnTrial(before, MADE_WEAPON);

  expect(after.player.loadout).toHaveLength(2);
  expect(after.player.loadout[0]).toBe(before.player.loadout[0]);
  expect(after.player.loadout[1]?.weapon).toBe(MADE_WEAPON);
});

it("takes the weapon in hand", () => {
  expect(worldWithWeaponOnTrial(practiceWorld(), MADE_WEAPON).player.equippedIndex).toBe(1);
});

it("fills the magazine and the reserve, whatever the weapon it replaces had left", () => {
  const before = practiceWorld();
  const [first, second] = before.player.loadout;
  const spent = {...before, player: {...before.player, loadout: [first, {...second, rounds: 1, reserve: 0}]}} as World;

  const carried = worldWithWeaponOnTrial(spent, MADE_WEAPON).player.loadout[1];

  expect(carried?.rounds).toBe(MADE_WEAPON.magazineSize);
  expect(carried?.reserve).toBe(MADE_WEAPON.startingReserve);
});

it("ends a reload that was going on", () => {
  const before = practiceWorld();
  const reloading = {...before, player: {...before.player, reloadRemainingSeconds: 0.7}};

  expect(worldWithWeaponOnTrial(reloading, MADE_WEAPON).player.reloadRemainingSeconds).toBeUndefined();
});

it("puts a weapon already in slot 2 in hand again, as it takes the new one", () => {
  const once = worldWithWeaponOnTrial(practiceWorld(), MADE_WEAPON);
  const another = {...MADE_WEAPON, bulletDamage: MADE_WEAPON.bulletDamage + 1};

  const twice = worldWithWeaponOnTrial(once, another);

  expect(twice.player.loadout).toHaveLength(2);
  expect(twice.player.loadout[1]?.weapon).toBe(another);
  expect(twice.player.equippedIndex).toBe(1);
});

it("changes nothing else in the world", () => {
  const before = practiceWorld();

  const after = worldWithWeaponOnTrial(before, MADE_WEAPON);

  expect({...after, player: undefined}).toEqual({...before, player: undefined});
  expect({...after.player, loadout: undefined, equippedIndex: undefined}).toEqual({
    ...before.player,
    loadout: undefined,
    equippedIndex: undefined,
  });
});

function practiceWorld(): World {
  return startingWorld(PRACTICE_ARENA, PRACTICE_DUMMIES);
}
