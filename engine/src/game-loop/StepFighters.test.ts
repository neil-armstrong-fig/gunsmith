import {PLAYER_HEALTH} from "@gunsmith/engine/health/PlayerHealth";
import {startingWorld} from "@gunsmith/engine/game-loop/StartingWorld";
import {giveOpponentBrain} from "@gunsmith/engine/opponent/GiveOpponentBrain";
import {step} from "@gunsmith/engine/game-loop/Step";
import {stepFighters} from "@gunsmith/engine/game-loop/StepFighters";
import type {Input} from "@gunsmith/engine/game-loop/types/Input";
import type {World} from "@gunsmith/engine/game-loop/types/World";
import {arena} from "@gunsmith/engine/game-loop/step/testing/Arena";
import {IDLE} from "@gunsmith/engine/game-loop/step/testing/Idle";
import {opponentOf} from "@gunsmith/engine/game-loop/step/testing/OpponentOf";
import {TICK} from "@gunsmith/engine/game-loop/step/testing/Tick";

// The first fighter starts at (7.5, 4.5) facing east and the second at (11.5, 4.5) facing west, on one clear row.
const FIGHTERS_APART = {x: 11.5, y: 4.5};

it("walks the second fighter by its own input, not by a brain", () => {
  const world = startingWorld(arena, [], FIGHTERS_APART);
  const walkingNorth: Input = {...IDLE, direction: {x: 0, y: 1}};
  const after = stepFighters(world, {first: IDLE, second: walkingNorth}, TICK);

  expect(opponentOf(after).position.y).toBeGreaterThan(FIGHTERS_APART.y);
  expect(opponentOf(after).position.x).toBe(FIGHTERS_APART.x);
  expect(after.player.position).toEqual(world.player.position);
});

it("lets the second fighter shoot the first", () => {
  const firingAtTheFirst: Input = {...IDLE, aimAt: {x: 7.5, y: 4.5}, firing: true};
  let world: World = startingWorld(arena, [], FIGHTERS_APART);
  for (let tick = 0; tick < 120; tick += 1) {
    world = stepFighters(world, {first: IDLE, second: firingAtTheFirst}, TICK);
  }

  expect(world.player.health).toBeLessThan(PLAYER_HEALTH);
});

it("lets the first fighter shoot the second", () => {
  const firingAtTheSecond: Input = {...IDLE, aimAt: FIGHTERS_APART, firing: true};
  let world: World = startingWorld(arena, [], FIGHTERS_APART);
  const health = opponentOf(world).health;
  for (let tick = 0; tick < 120; tick += 1) {
    world = stepFighters(world, {first: firingAtTheSecond, second: IDLE}, TICK);
  }

  expect(opponentOf(world).health).toBeLessThan(health);
});

it("ignores a brain the world carries: the second fighter is played by a human", () => {
  const world = giveOpponentBrain(startingWorld(arena, [], FIGHTERS_APART), 7);
  let after = world;
  for (let tick = 0; tick < 5; tick += 1) {
    after = stepFighters(after, {first: IDLE, second: IDLE}, TICK);
  }

  expect(world.opponentBrain).toBeDefined();
  expect(opponentOf(after).position).toEqual(FIGHTERS_APART);
  expect(after.opponentBrain).toBeUndefined();
});

it("plays a first fighter the same as step does", () => {
  const world = startingWorld(arena, [], FIGHTERS_APART);
  const walkingEast: Input = {...IDLE, direction: {x: 1, y: 0}};

  expect(stepFighters(world, {first: walkingEast, second: IDLE}, TICK).player).toEqual(
    step(world, walkingEast, TICK).player,
  );
});

it("freezes once the round is decided, whoever asks", () => {
  const world: World = {...startingWorld(arena, [], FIGHTERS_APART), round: "won"};
  const walkingNorth: Input = {...IDLE, direction: {x: 0, y: 1}};
  const after = stepFighters(world, {first: walkingNorth, second: walkingNorth}, TICK);

  expect(after.player.position).toEqual(world.player.position);
  expect(opponentOf(after).position).toEqual(FIGHTERS_APART);
  expect(after.elapsedSeconds).toBeCloseTo(TICK, 9);
});

it("steps the same world and inputs to the same next world", () => {
  const world = startingWorld(arena, [], FIGHTERS_APART);
  const inputs = {first: {...IDLE, firing: true}, second: {...IDLE, direction: {x: 0, y: -1}}};

  expect(stepFighters(world, inputs, TICK)).toEqual(stepFighters(world, inputs, TICK));
});
