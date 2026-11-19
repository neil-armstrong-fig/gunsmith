import {DUMMY_HEALTH} from "@gunsmith/engine/dummy/DummyHealth";
import {startingWorld} from "@gunsmith/engine/game-loop/StartingWorld";
import type {World} from "@gunsmith/engine/game-loop/types/World";
import {PRACTICE_ARENA} from "@src/game/practice/PracticeArena";
import {PRACTICE_DUMMIES} from "@src/game/practice/PracticeDummies";
import {worldWithRangeReset} from "@src/react/components/dom/workshop/hooks/use-practice-reset-key/range-reset/WorldWithRangeReset";
import {expect, it} from "vitest";

it("stands every dummy again at full health, where it stood", () => {
  const after = worldWithRangeReset(playedWorld());

  expect(after.dummies).toEqual(PRACTICE_DUMMIES.map(position => ({position, health: DUMMY_HEALTH})));
});

it("stands a felled dummy up, which a world without it had lost from its list", () => {
  const played = playedWorld();

  expect(played.dummies.length).toBeLessThan(PRACTICE_DUMMIES.length);
  expect(worldWithRangeReset(played).dummies).toHaveLength(PRACTICE_DUMMIES.length);
});

it("fills the magazine and the reserve of both weapons", () => {
  const loadout = worldWithRangeReset(playedWorld()).player.loadout;

  expect(loadout).toHaveLength(2);
  for (const carried of loadout) {
    expect(carried.rounds).toBe(carried.weapon.magazineSize);
    expect(carried.reserve).toBe(carried.weapon.startingReserve);
  }
});

it("ends a reload that was going on", () => {
  const played = playedWorld();
  const reloading = {...played, player: {...played.player, reloadRemainingSeconds: 0.4}};

  expect(worldWithRangeReset(reloading).player.reloadRemainingSeconds).toBeUndefined();
});

it("leaves the player where they stand, facing as they face, in hand with the weapon they hold", () => {
  const played = playedWorld();

  const after = worldWithRangeReset(played).player;

  expect(after.position).toEqual(played.player.position);
  expect(after.aim).toEqual(played.player.aim);
  expect(after.equippedIndex).toBe(played.player.equippedIndex);
});

function playedWorld(): World {
  const world = startingWorld(PRACTICE_ARENA, PRACTICE_DUMMIES);
  const loadout = world.player.loadout.map(carried => ({...carried, rounds: 1, reserve: 0}));
  // The first dummy is felled, the rest are hurt.
  const dummies = world.dummies.slice(1).map(dummy => ({...dummy, health: 20}));

  return {
    ...world,
    dummies,
    player: {...world.player, position: {x: 9.5, y: 8.5}, aim: {x: 0, y: 1}, loadout, equippedIndex: 1},
  };
}
