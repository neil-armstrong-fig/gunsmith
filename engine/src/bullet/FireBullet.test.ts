import {fireBullet} from "@gunsmith/engine/bullet/FireBullet";
import {PLAYER_RADIUS} from "@gunsmith/engine/player/PlayerRadius";
import type {Weapon} from "@gunsmith/engine/weapon/types/Weapon";

const FROM = {x: 5, y: 5};
const WEAPON: Weapon = {
  fireIntervalSeconds: 0.2,
  bulletDamage: 25,
  bulletSpeed: 20,
  magazineSize: 10,
  reloadSeconds: 1,
  startingReserve: 30,
};

it("sends the bullet the way the player is aiming", () => {
  expect(fireBullet(FROM, {x: 0, y: 1}, WEAPON).direction).toEqual({x: 0, y: 1});
});

it("starts the bullet just outside the player, along the aim", () => {
  const bullet = fireBullet(FROM, {x: 1, y: 0}, WEAPON);

  expect(bullet.position.y).toBe(5);
  expect(bullet.position.x - FROM.x).toBeGreaterThan(PLAYER_RADIUS + 0.01);
});

it("starts a bullet aimed down and to the west south-west of the player", () => {
  const bullet = fireBullet(FROM, {x: -Math.SQRT1_2, y: -Math.SQRT1_2}, WEAPON);

  expect(bullet.position.x).toBeLessThan(FROM.x);
  expect(bullet.position.y).toBeLessThan(FROM.y);
});

it("gives the bullet the damage of the weapon that fired it", () => {
  expect(fireBullet(FROM, {x: 1, y: 0}, {...WEAPON, bulletDamage: 50}).damage).toBe(50);
});

it("gives the bullet the speed of the weapon that fired it", () => {
  expect(fireBullet(FROM, {x: 1, y: 0}, {...WEAPON, bulletSpeed: 30}).speed).toBe(30);
});
