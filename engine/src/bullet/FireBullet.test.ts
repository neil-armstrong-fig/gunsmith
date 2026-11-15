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
  visionDegrees: 90,
  visionRange: 12,
};

it("sends the bullet the way the player is aiming", () => {
  expect(fireBullet("player", {from: FROM, aim: {x: 0, y: 1}, weapon: WEAPON, level: 0}).direction).toEqual({
    x: 0,
    y: 1,
  });
});

it("starts the bullet just outside the player, along the aim", () => {
  const bullet = fireBullet("player", {from: FROM, aim: {x: 1, y: 0}, weapon: WEAPON, level: 0});

  expect(bullet.position.y).toBe(5);
  expect(bullet.position.x - FROM.x).toBeGreaterThan(PLAYER_RADIUS + 0.01);
});

it("starts a bullet aimed down and to the west south-west of the player", () => {
  const bullet = fireBullet("player", {
    from: FROM,
    aim: {x: -Math.SQRT1_2, y: -Math.SQRT1_2},
    weapon: WEAPON,
    level: 0,
  });

  expect(bullet.position.x).toBeLessThan(FROM.x);
  expect(bullet.position.y).toBeLessThan(FROM.y);
});

it("gives the bullet the damage of the weapon that fired it", () => {
  expect(
    fireBullet("player", {from: FROM, aim: {x: 1, y: 0}, weapon: {...WEAPON, bulletDamage: 50}, level: 0}).damage,
  ).toBe(50);
});

it("gives the bullet the speed of the weapon that fired it", () => {
  expect(
    fireBullet("player", {from: FROM, aim: {x: 1, y: 0}, weapon: {...WEAPON, bulletSpeed: 30}, level: 0}).speed,
  ).toBe(30);
});

it("marks the bullet as the player's when the player fired it", () => {
  expect(fireBullet("player", {from: FROM, aim: {x: 1, y: 0}, weapon: WEAPON, level: 0}).shooter).toBe("player");
});

it("marks the bullet as the opponent's when the opponent fired it", () => {
  expect(fireBullet("opponent", {from: FROM, aim: {x: 1, y: 0}, weapon: WEAPON, level: 0}).shooter).toBe("opponent");
});

it("gives the bullet the level of the shooter's eye", () => {
  expect(fireBullet("player", {from: FROM, aim: {x: 1, y: 0}, weapon: WEAPON, level: 1}).level).toBe(1);
});
