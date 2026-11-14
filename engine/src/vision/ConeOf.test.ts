import {startingWorld} from "@gunsmith/engine/game-loop/StartingWorld";
import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {switchWeapon} from "@gunsmith/engine/loadout/SwitchWeapon";
import {MARKSMAN_RIFLE} from "@gunsmith/engine/weapon/weapons/MarksmanRifle";
import {RIFLE} from "@gunsmith/engine/weapon/weapons/Rifle";
import {coneOf} from "@gunsmith/engine/vision/ConeOf";

const player = startingWorld(arenaFrom(["#####", "#...#", "#...#", "#...#", "#####"])).player;

it("starts at the player and points where the player aims", () => {
  const cone = coneOf({...player, position: {x: 2, y: 3}, aim: {x: 0, y: 1}});

  expect(cone.apex).toEqual({x: 2, y: 3});
  expect(cone.aim).toEqual({x: 0, y: 1});
});

it("takes its width and range from the weapon in hand", () => {
  const cone = coneOf(player);

  expect(cone.range).toBe(RIFLE.visionRange);
  expect(cone.halfAngleRadians).toBeCloseTo((RIFLE.visionDegrees / 2) * (Math.PI / 180), 10);
});

it("changes with the weapon in hand", () => {
  const marksman = coneOf(switchWeapon(player, 2));

  expect(marksman.range).toBe(MARKSMAN_RIFLE.visionRange);
  expect(marksman.range).not.toBe(RIFLE.visionRange);
});

it("is as wide as the weapon in hand says, not a fixed width", () => {
  const narrow = {...RIFLE, visionDegrees: 60};
  const holdingNarrow = {...player, loadout: [{weapon: narrow, rounds: 1, reserve: 0}]};

  expect(coneOf(holdingNarrow).halfAngleRadians).toBeCloseTo(Math.PI / 6, 10);
});
