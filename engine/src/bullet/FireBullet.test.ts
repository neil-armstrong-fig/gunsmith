import {fireBullet} from "@gunsmith/engine/bullet/FireBullet";
import {PLAYER_RADIUS} from "@gunsmith/engine/player/PlayerRadius";

const FROM = {x: 5, y: 5};

it("sends the bullet the way the player is aiming", () => {
  expect(fireBullet(FROM, {x: 0, y: 1}).direction).toEqual({x: 0, y: 1});
});

it("starts the bullet just outside the player, along the aim", () => {
  const bullet = fireBullet(FROM, {x: 1, y: 0});

  expect(bullet.position.y).toBe(5);
  expect(bullet.position.x - FROM.x).toBeGreaterThan(PLAYER_RADIUS + 0.01);
});

it("starts a bullet aimed down and to the west south-west of the player", () => {
  const bullet = fireBullet(FROM, {x: -Math.SQRT1_2, y: -Math.SQRT1_2});

  expect(bullet.position.x).toBeLessThan(FROM.x);
  expect(bullet.position.y).toBeLessThan(FROM.y);
});
