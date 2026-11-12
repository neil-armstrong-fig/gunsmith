import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
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
