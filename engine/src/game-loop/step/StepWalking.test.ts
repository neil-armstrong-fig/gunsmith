import {CROUCH_SPEED_FACTOR} from "@gunsmith/engine/player/walking/CrouchSpeedFactor";
import {PLAYER_SPEED} from "@gunsmith/engine/player/walking/PlayerSpeed";
import {step} from "@gunsmith/engine/game-loop/Step";
import type {World} from "@gunsmith/engine/game-loop/types/World";
import {TICK} from "@gunsmith/engine/game-loop/step/testing/Tick";
import {IDLE} from "@gunsmith/engine/game-loop/step/testing/Idle";
import {walking} from "@gunsmith/engine/game-loop/step/testing/Walking";
import {centred} from "@gunsmith/engine/game-loop/step/testing/Centred";

it("leaves the player where they are when nothing is held", () => {
  const world = centred();

  expect(step(world, walking(0, 0), TICK).player.position).toEqual(world.player.position);
});

it("moves the player east at the player speed", () => {
  const world = centred();
  const after = step(world, walking(1, 0), TICK);

  expect(after.player.position.x - world.player.position.x).toBeCloseTo(PLAYER_SPEED * TICK, 9);
  expect(after.player.position.y).toBe(world.player.position.y);
});

it("crouches the player while the input says so, and stands them up when it stops", () => {
  const world = centred();
  const crouching = step(world, {...walking(0, 0), crouching: true}, TICK);

  expect(world.player.crouching).toBe(false);
  expect(crouching.player.crouching).toBe(true);
  expect(step(crouching, walking(0, 0), TICK).player.crouching).toBe(false);
});

it("walks a crouching player the crouch factor as far", () => {
  const world = centred();
  const after = step(world, {...walking(1, 0), crouching: true}, TICK);

  expect(after.player.position.x - world.player.position.x).toBeCloseTo(PLAYER_SPEED * CROUCH_SPEED_FACTOR * TICK, 9);
});

it("moves the player north when y is positive", () => {
  const world = centred();

  expect(step(world, walking(0, 1), TICK).player.position.y).toBeGreaterThan(world.player.position.y);
});

it("goes no faster on a diagonal", () => {
  const world = centred();
  const after = step(world, walking(1, 1), TICK);
  const travelled = Math.hypot(
    after.player.position.x - world.player.position.x,
    after.player.position.y - world.player.position.y,
  );

  expect(travelled).toBeCloseTo(PLAYER_SPEED * TICK, 9);
});

it("goes no faster when the input asks for more than full speed", () => {
  const world = centred();
  const after = step(world, walking(50, 0), TICK);

  expect(after.player.position.x - world.player.position.x).toBeCloseTo(PLAYER_SPEED * TICK, 9);
});

it("advances the clock by the time stepped", () => {
  expect(step(centred(), walking(0, 0), TICK).elapsedSeconds).toBeCloseTo(TICK, 12);
});

it("does not change the world it was given", () => {
  const world = centred();
  const before = structuredClone(world);

  step(world, walking(1, 0), TICK);

  expect(world).toEqual(before);
});

it("stops the player at the east wall, however long east is held", () => {
  let world = centred();
  for (let tick = 0; tick < 600; tick += 1) {
    world = step(world, walking(1, 0), TICK);
  }

  expect(world.player.position.x).toBeLessThan(14);
  expect(world.player.position.x).toBeGreaterThan(13);
});

it("stops the player at the north wall", () => {
  let world = centred();
  for (let tick = 0; tick < 600; tick += 1) {
    world = step(world, walking(0, 1), TICK);
  }

  expect(world.player.position.y).toBeLessThan(8);
  expect(world.player.position.y).toBeGreaterThan(7);
});

it("slides along a wall instead of sticking to it", () => {
  let world: World = {...centred(), player: {...centred().player, position: {x: 13.6, y: 4.5}}};
  for (let tick = 0; tick < 30; tick += 1) {
    world = step(world, walking(1, 1), TICK);
  }

  expect(world.player.position.x).toBeLessThan(14);
  expect(world.player.position.y).toBeGreaterThan(5);
});

it("plays the same way every time from the same inputs", () => {
  function play(): World {
    let world = centred();
    for (let tick = 0; tick < 200; tick += 1) {
      world = step(world, walking(Math.sin(tick), Math.cos(tick)), TICK);
    }

    return world;
  }

  expect(play()).toEqual(play());
});

it("turns the player to face the point being aimed at", () => {
  const world = step(centred(), {...IDLE, aimAt: {x: 7.5, y: 14}}, TICK);

  expect(world.player.aim.x).toBeCloseTo(0, 9);
  expect(world.player.aim.y).toBeCloseTo(1, 9);
});

it("keeps facing the same way when nothing is aimed at", () => {
  const turned = step(centred(), {...IDLE, aimAt: {x: 0, y: 7.5}}, TICK);

  expect(step(turned, IDLE, TICK).player.aim).toEqual(turned.player.aim);
});
