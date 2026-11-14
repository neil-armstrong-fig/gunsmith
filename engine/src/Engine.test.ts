import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {engine} from "@gunsmith/engine/Engine";
import {startingWorld} from "@gunsmith/engine/game-loop/StartingWorld";
import {step} from "@gunsmith/engine/game-loop/Step";
import type {Input} from "@gunsmith/engine/game-loop/types/Input";

const ARENA = arenaFrom(["#####", "#...#", "#...#", "#...#", "#####"]);
const NO_INPUT: Input = {direction: {x: 0, y: 0}, firing: false, reload: false};

it("builds a first world the way startingWorld does", () => {
  expect(engine.startingWorld(ARENA)).toEqual(startingWorld(ARENA));
});

it("builds a first world with the dummies and the opponent it is given", () => {
  const dummyPositions = [{x: 3.5, y: 1.5}];
  const opponentPosition = {x: 3.5, y: 3.5};

  expect(engine.startingWorld(ARENA, dummyPositions, opponentPosition)).toEqual(
    startingWorld(ARENA, dummyPositions, opponentPosition),
  );
});

it("moves a world on one step the way step does", () => {
  const world = engine.startingWorld(ARENA);

  expect(engine.step(world, NO_INPUT, 0.5)).toEqual(step(world, NO_INPUT, 0.5));
});

it("runs the clock on when a world built by the engine is stepped", () => {
  const world = engine.step(engine.startingWorld(ARENA), NO_INPUT, 0.5);

  expect(world.elapsedSeconds).toBe(0.5);
});
