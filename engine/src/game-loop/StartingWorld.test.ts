import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {DUMMY_HEALTH} from "@gunsmith/engine/dummy/DummyHealth";
import {startingWorld} from "@gunsmith/engine/game-loop/StartingWorld";

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
