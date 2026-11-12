import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {DUMMY_HEALTH} from "@gunsmith/engine/dummy/DummyHealth";
import {startingWorld} from "@gunsmith/engine/game-loop/StartingWorld";
import {MARKSMAN_RIFLE} from "@gunsmith/engine/weapon/weapons/MarksmanRifle";
import {RIFLE} from "@gunsmith/engine/weapon/weapons/Rifle";

it("stands the player in the middle of the centre tile", () => {
  const world = startingWorld(arenaFrom(["#####", "#...#", "#...#", "#...#", "#####"]));

  expect(world.player.position).toEqual({x: 2.5, y: 2.5});
});

it("starts the clock at zero", () => {
  const world = startingWorld(arenaFrom(["###", "#.#", "###"]));

  expect(world.elapsedSeconds).toBe(0);
});

it("starts with no bullets in the air", () => {
  expect(startingWorld(arenaFrom(["###", "#.#", "###"])).bullets).toEqual([]);
});

it("starts the player facing east with the weapon ready", () => {
  const {player} = startingWorld(arenaFrom(["###", "#.#", "###"]));

  expect(player.aim).toEqual({x: 1, y: 0});
  expect(player.cooldownSeconds).toBe(0);
});

it("starts with no dummies when none are asked for", () => {
  expect(startingWorld(arenaFrom(["###", "#.#", "###"])).dummies).toEqual([]);
});

it("stands a dummy at full health at each place it is asked to", () => {
  const world = startingWorld(arenaFrom(["#####", "#...#", "#...#", "#...#", "#####"]), [
    {x: 1.5, y: 1.5},
    {x: 3.5, y: 3.5},
  ]);

  expect(world.dummies).toEqual([
    {position: {x: 1.5, y: 1.5}, health: DUMMY_HEALTH},
    {position: {x: 3.5, y: 3.5}, health: DUMMY_HEALTH},
  ]);
});

it("carries the rifle in slot 1 and the marksman rifle in slot 2, each with a full magazine and its whole reserve", () => {
  const {player} = startingWorld(arenaFrom(["###", "#.#", "###"]));

  expect(player.loadout).toEqual([
    {weapon: RIFLE, rounds: RIFLE.magazineSize, reserve: RIFLE.startingReserve},
    {weapon: MARKSMAN_RIFLE, rounds: MARKSMAN_RIFLE.magazineSize, reserve: MARKSMAN_RIFLE.startingReserve},
  ]);
});

it("starts with the rifle in hand and no reload under way", () => {
  const {player} = startingWorld(arenaFrom(["###", "#.#", "###"]));

  expect(player.equippedIndex).toBe(0);
  expect(player.reloadRemainingSeconds).toBeUndefined();
});
