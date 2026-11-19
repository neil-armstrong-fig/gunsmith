import {fireBullet} from "@gunsmith/engine/bullet/FireBullet";
import {step} from "@gunsmith/engine/game-loop/Step";
import type {World} from "@gunsmith/engine/game-loop/types/World";
import {RIFLE} from "@gunsmith/engine/weapon/weapons/Rifle";
import {TICK} from "@gunsmith/engine/game-loop/step/testing/Tick";
import {IDLE} from "@gunsmith/engine/game-loop/step/testing/Idle";
import {upstairs} from "@gunsmith/engine/game-loop/step/testing/Upstairs";
import {centred} from "@gunsmith/engine/game-loop/step/testing/Centred";
import {firingAt} from "@gunsmith/engine/game-loop/step/testing/FiringAt";

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

  expect((later.bullets[0]?.position.y ?? 0) - (fired.bullets[0]?.position.y ?? 0)).toBeCloseTo(
    RIFLE.bulletSpeed * TICK,
    9,
  );
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
  const after = step(centred(), {...IDLE, direction: {x: 1, y: 0}, aimAt: east, firing: true}, TICK);

  expect(after.bullets[0]?.position).toEqual(
    fireBullet("player", {
      from: after.player.position,
      aim: after.player.aim,
      weapon: RIFLE,
      level: 0,
      crouching: false,
    }).position,
  );
});

it("fires the player's bullet at the level of the ground they stand on", () => {
  const after = step({...centred(), arena: upstairs}, {...IDLE, aimAt: {x: 20, y: 4.5}, firing: true}, TICK);

  expect(after.bullets[0]?.level).toBe(1);
});
