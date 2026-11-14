import {startingWorld} from "@gunsmith/engine/game-loop/StartingWorld";
import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {switchWeapon} from "@gunsmith/engine/loadout/SwitchWeapon";
import {MARKSMAN_RIFLE} from "@gunsmith/engine/weapon/weapons/MarksmanRifle";
import {RIFLE} from "@gunsmith/engine/weapon/weapons/Rifle";
import {coneOf} from "@gunsmith/engine/vision/ConeOf";
import {CROUCH_RANGE_FACTOR} from "@gunsmith/engine/vision/cone/CrouchRangeFactor";

const room = arenaFrom(["#####", "#...#", "#...#", "#...#", "#####"]);
const player = startingWorld(room).player;

it("starts at the player and points where the player aims", () => {
  const cone = coneOf(room, {...player, position: {x: 2, y: 3}, aim: {x: 0, y: 1}});

  expect(cone.apex).toEqual({x: 2, y: 3});
  expect(cone.aim).toEqual({x: 0, y: 1});
});

it("takes its width and range from the weapon in hand", () => {
  const cone = coneOf(room, player);

  expect(cone.range).toBe(RIFLE.visionRange);
  expect(cone.halfAngleRadians).toBeCloseTo((RIFLE.visionDegrees / 2) * (Math.PI / 180), 10);
});

it("changes with the weapon in hand", () => {
  const marksman = coneOf(room, switchWeapon(player, 2));

  expect(marksman.range).toBe(MARKSMAN_RIFLE.visionRange);
  expect(marksman.range).not.toBe(RIFLE.visionRange);
});

it("is as wide as the weapon in hand says, not a fixed width", () => {
  const narrow = {...RIFLE, visionDegrees: 60};
  const holdingNarrow = {...player, loadout: [{weapon: narrow, rounds: 1, reserve: 0}]};

  expect(coneOf(room, holdingNarrow).halfAngleRadians).toBeCloseTo(Math.PI / 6, 10);
});

it("reaches the crouch factor farther when the fighter is crouching, and no wider", () => {
  const standing = coneOf(room, player);
  const crouching = coneOf(room, {...player, crouching: true});

  expect(crouching.range).toBeCloseTo(standing.range * CROUCH_RANGE_FACTOR, 9);
  expect(crouching.halfAngleRadians).toBe(standing.halfAngleRadians);
});

it("reaches farther crouching than standing, whichever weapon is in hand", () => {
  const marksman = switchWeapon(player, 2);

  expect(coneOf(room, {...marksman, crouching: true}).range).toBeCloseTo(
    MARKSMAN_RIFLE.visionRange * CROUCH_RANGE_FACTOR,
    9,
  );
});

it("keeps the apex and the aim when crouching", () => {
  const cone = coneOf(room, {...player, position: {x: 2, y: 3}, aim: {x: 0, y: 1}, crouching: true});

  expect(cone.apex).toEqual({x: 2, y: 3});
  expect(cone.aim).toEqual({x: 0, y: 1});
});

it("is a longer reach by a real margin", () => {
  expect(CROUCH_RANGE_FACTOR).toBeGreaterThan(1.2);
});

// Low ground at x 1, a stair at x 2 up to level 1 at x 3, a stair at x 4 up to level 2 at x 5.
const terraces = arenaFrom(["#######", "#.>1>2#", "#######"]);

it("looks from the level of the ground the fighter stands on", () => {
  expect(coneOf(terraces, {...player, position: {x: 1.5, y: 1.5}}).eyeLevel).toBe(0);
  expect(coneOf(terraces, {...player, position: {x: 3.5, y: 1.5}}).eyeLevel).toBe(1);
  expect(coneOf(terraces, {...player, position: {x: 5.5, y: 1.5}}).eyeLevel).toBe(2);
});

it("looks from the upper level while the fighter is on a stair", () => {
  expect(coneOf(terraces, {...player, position: {x: 2.5, y: 1.5}}).eyeLevel).toBe(1);
});
