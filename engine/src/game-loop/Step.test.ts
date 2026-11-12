import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {fireBullet} from "@gunsmith/engine/bullet/FireBullet";
import {BULLET_SPEED} from "@gunsmith/engine/bullet/flight/BulletSpeed";
import {DUMMY_HEALTH} from "@gunsmith/engine/dummy/DummyHealth";
import {PLAYER_SPEED} from "@gunsmith/engine/player/walking/PlayerSpeed";
import {startingWorld} from "@gunsmith/engine/game-loop/StartingWorld";
import {step} from "@gunsmith/engine/game-loop/Step";
import type {Input} from "@gunsmith/engine/game-loop/types/Input";
import type {World} from "@gunsmith/engine/game-loop/types/World";
import {BULLET_DAMAGE} from "@gunsmith/engine/weapon/damage/BulletDamage";

const arena = arenaFrom([
  "###############",
  "#.............#",
  "#.............#",
  "#.............#",
  "#.............#",
  "#.............#",
  "#.............#",
  "#.............#",
  "###############",
]);
const TICK = 1 / 60;

function walking(x: number, y: number): Input {
  return {direction: {x, y}, firing: false};
}

function centred(): World {
  return startingWorld(arena);
}

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

const IDLE: Input = {direction: {x: 0, y: 0}, firing: false};

function firingAt(target: {x: number; y: number}): Input {
  return {...IDLE, aimAt: target, firing: true};
}

it("turns the player to face the point being aimed at", () => {
  const world = step(centred(), {...IDLE, aimAt: {x: 7.5, y: 14}}, TICK);

  expect(world.player.aim.x).toBeCloseTo(0, 9);
  expect(world.player.aim.y).toBeCloseTo(1, 9);
});

it("keeps facing the same way when nothing is aimed at", () => {
  const turned = step(centred(), {...IDLE, aimAt: {x: 0, y: 7.5}}, TICK);

  expect(step(turned, IDLE, TICK).player.aim).toEqual(turned.player.aim);
});

it("fires no bullet when the trigger is not held", () => {
  expect(step(centred(), IDLE, TICK).bullets).toEqual([]);
});

it("fires one bullet the way the player is aiming when the trigger is held", () => {
  const [bullet] = step(centred(), firingAt({x: 7.5, y: 14}), TICK).bullets;

  expect(bullet?.direction.x).toBeCloseTo(0, 9);
  expect(bullet?.direction.y).toBeCloseTo(1, 9);
  expect(bullet?.position.y).toBeGreaterThan(centred().player.position.y);
});

it("fires from the player's own position, including after they have walked", () => {
  const walked: World = {...centred(), player: {...centred().player, position: {x: 3.5, y: 2.5}}};
  const [bullet] = step(walked, firingAt({x: 3.5, y: 14}), TICK).bullets;

  expect(bullet?.position.x).toBeCloseTo(3.5, 9);
});

it("will not fire a second bullet on the very next step, however long the trigger is held", () => {
  const first = step(centred(), firingAt({x: 7.5, y: 14}), TICK);

  expect(step(first, firingAt({x: 7.5, y: 14}), TICK).bullets).toHaveLength(1);
});

it("fires again once the weapon has cooled down, while the first bullet is still flying", () => {
  const east = {x: 20, y: 4.5};
  let world = step(centred(), firingAt(east), TICK);
  for (let tick = 0; tick < 16; tick += 1) {
    world = step(world, firingAt(east), TICK);
  }

  expect(world.bullets).toHaveLength(2);
});

it("flies a bullet on at the bullet speed on later steps", () => {
  const fired = step(centred(), firingAt({x: 7.5, y: 14}), TICK);
  const later = step(fired, IDLE, TICK);

  expect((later.bullets[0]?.position.y ?? 0) - (fired.bullets[0]?.position.y ?? 0)).toBeCloseTo(BULLET_SPEED * TICK, 9);
});

it("removes a bullet when it hits the wall", () => {
  let world = step(centred(), firingAt({x: 7.5, y: 14}), TICK);
  for (let tick = 0; tick < 120; tick += 1) {
    world = step(world, IDLE, TICK);
  }

  expect(world.bullets).toEqual([]);
});

it("does not fire a bullet that would start inside a wall", () => {
  const againstWall: World = {...centred(), player: {...centred().player, position: {x: 14 - 0.4, y: 4.5}}};
  const fired = step(againstWall, firingAt({x: 20, y: 4.5}), TICK);

  expect(step(fired, IDLE, TICK).bullets).toEqual([]);
});

it("starts a new bullet at the muzzle of the player where they now stand, and does not move it until the next step", () => {
  const east = {x: 20, y: 4.5};
  const after = step(centred(), {direction: {x: 1, y: 0}, aimAt: east, firing: true}, TICK);

  expect(after.bullets[0]?.position).toEqual(fireBullet(after.player.position, after.player.aim).position);
});

// The player starts at (7.5, 4.5) facing east; four tiles east of that is a dummy on the same row.
function withDummyEast(): World {
  return startingWorld(arena, [{x: 11.5, y: 4.5}]);
}

/** Holds the trigger toward the east for `heldTicks` steps, then lets go for `idleTicks` more. */
function shoot(world: World, heldTicks: number, idleTicks: number): World {
  let later = world;
  for (let tick = 0; tick < heldTicks; tick += 1) {
    later = step(later, firingAt({x: 20, y: 4.5}), TICK);
  }

  for (let tick = 0; tick < idleTicks; tick += 1) {
    later = step(later, IDLE, TICK);
  }

  return later;
}

it("hurts a dummy the player shoots at", () => {
  const after = shoot(withDummyEast(), 1, 30);

  expect(after.dummies[0]?.health).toBe(DUMMY_HEALTH - BULLET_DAMAGE);
});

it("uses up the bullet that hit the dummy, well before the wall would have", () => {
  // The dummy is two tiles from the muzzle; the wall is six. After 0.1 s a free bullet would be two tiles out, past the dummy.
  const near = startingWorld(arena, [{x: 9.5, y: 4.5}]);

  expect(shoot(near, 1, 6).bullets).toEqual([]);
  expect(shoot(startingWorld(arena), 1, 6).bullets).toHaveLength(1);
});

it("takes the dummy out of the world once enough shots have landed", () => {
  expect(withDummyEast().dummies).toHaveLength(1);
  expect(shoot(withDummyEast(), 180, 0).dummies).toEqual([]);
});

it("does not hurt a dummy that is not in the line of fire", () => {
  const aside = startingWorld(arena, [{x: 11.5, y: 7}]);

  expect(shoot(aside, 1, 30).dummies[0]?.health).toBe(DUMMY_HEALTH);
});

it("does not change the dummies of the world it was given", () => {
  const world = withDummyEast();
  const before = structuredClone(world);

  shoot(world, 60, 0);

  expect(world).toEqual(before);
});
