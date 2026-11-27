import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {fireBullet} from "@gunsmith/engine/bullet/FireBullet";
import {PLAYER_RADIUS} from "@gunsmith/engine/player/PlayerRadius";
import type {ShotRequest} from "@gunsmith/engine/bullet/types/ShotRequest";
import type {Point} from "@gunsmith/engine/geometry/types/Point";
import type {Weapon} from "@gunsmith/engine/weapon/types/Weapon";

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

describe("on open ground", () => {
  // Open low ground, x 1 to 9 and y 1 to 9.
  const OPEN = arenaFrom(["###########", ...Array<string>(9).fill("#.........#"), "###########"]);
  const FROM = {x: 5, y: 5};

  it("sends the bullet the way the player is aiming", () => {
    expect(
      fireBullet(OPEN, "player", {from: FROM, aim: {x: 0, y: 1}, weapon: WEAPON, level: 0, crouching: false}).direction,
    ).toEqual({
      x: 0,
      y: 1,
    });
  });

  it("starts the bullet just outside the player, along the aim", () => {
    const bullet = fireBullet(OPEN, "player", {
      from: FROM,
      aim: {x: 1, y: 0},
      weapon: WEAPON,
      level: 0,
      crouching: false,
    });

    expect(bullet.position.y).toBe(5);
    expect(bullet.position.x - FROM.x).toBeGreaterThan(PLAYER_RADIUS + 0.01);
  });

  it("starts a bullet aimed down and to the west south-west of the player", () => {
    const bullet = fireBullet(OPEN, "player", {
      from: FROM,
      aim: {x: -Math.SQRT1_2, y: -Math.SQRT1_2},
      weapon: WEAPON,
      level: 0,
      crouching: false,
    });

    expect(bullet.position.x).toBeLessThan(FROM.x);
    expect(bullet.position.y).toBeLessThan(FROM.y);
  });

  it("gives the bullet the damage of the weapon that fired it", () => {
    expect(
      fireBullet(OPEN, "player", {
        from: FROM,
        aim: {x: 1, y: 0},
        weapon: {...WEAPON, bulletDamage: 50},
        level: 0,
        crouching: false,
      }).damage,
    ).toBe(50);
  });

  it("gives the bullet the speed of the weapon that fired it", () => {
    expect(
      fireBullet(OPEN, "player", {
        from: FROM,
        aim: {x: 1, y: 0},
        weapon: {...WEAPON, bulletSpeed: 30},
        level: 0,
        crouching: false,
      }).speed,
    ).toBe(30);
  });

  it("marks the bullet as the player's when the player fired it", () => {
    expect(
      fireBullet(OPEN, "player", {from: FROM, aim: {x: 1, y: 0}, weapon: WEAPON, level: 0, crouching: false}).shooter,
    ).toBe("player");
  });

  it("marks the bullet as the opponent's when the opponent fired it", () => {
    expect(
      fireBullet(OPEN, "opponent", {from: FROM, aim: {x: 1, y: 0}, weapon: WEAPON, level: 0, crouching: false}).shooter,
    ).toBe("opponent");
  });

  it("gives the bullet the level of the shooter's eye", () => {
    expect(
      fireBullet(OPEN, "player", {from: FROM, aim: {x: 1, y: 0}, weapon: WEAPON, level: 1, crouching: false}).level,
    ).toBe(1);
  });

  it("marks the bullet with the stance the shooter fired in", () => {
    const shot = {from: FROM, aim: {x: 1, y: 0}, weapon: WEAPON, level: 0};

    expect(fireBullet(OPEN, "player", {...shot, crouching: true}).crouching).toBe(true);
    expect(fireBullet(OPEN, "player", {...shot, crouching: false}).crouching).toBe(false);
  });
});

describe("the lowest level it can hurt", () => {
  // Low ground at x 1 to 3, a platform one level up at x 4 to 8 (its faces at x = 4 and x = 9), with a top two levels up at x 7 and
  // 8, and low ground at x 9.
  const platform = arenaFrom(["###########", "#...11122.#", "###########"]);
  const EAST = {x: 1, y: 0};
  const WEST = {x: -1, y: 0};

  it("is the low ground for a shot from the low ground", () => {
    expect(fireBullet(platform, "player", shotFrom({x: 1.5, y: 1.5}, EAST, 0)).floor).toBe(0);
  });

  it("is the platform's level for a shot from back on the platform, so it flies over the low ground", () => {
    expect(fireBullet(platform, "player", shotFrom({x: 5.5, y: 1.5}, WEST, 1)).floor).toBe(1);
  });

  it("is the low ground for a shot from the platform's edge out over it", () => {
    expect(fireBullet(platform, "player", shotFrom({x: 4.5, y: 1.5}, WEST, 1)).floor).toBe(0);
  });

  it("is the platform's level for a shot from its edge back across it", () => {
    expect(fireBullet(platform, "player", shotFrom({x: 4.5, y: 1.5}, EAST, 1)).floor).toBe(1);
  });

  it("is the lowest ground within reach of the shooter, for a shot from the top's edge down onto the platform", () => {
    expect(fireBullet(platform, "player", shotFrom({x: 7.5, y: 1.5}, WEST, 2)).floor).toBe(1);
  });
});

function shotFrom(from: Point, aim: Point, level: number): ShotRequest {
  return {from, aim, weapon: WEAPON, level, crouching: false};
}
