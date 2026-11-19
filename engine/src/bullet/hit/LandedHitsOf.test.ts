import {landedHitsOf} from "@gunsmith/engine/bullet/hit/LandedHitsOf";
import type {Bullet} from "@gunsmith/engine/bullet/types/Bullet";
import type {Contact} from "@gunsmith/engine/bullet/types/Contact";
import type {Meeting} from "@gunsmith/engine/bullet/types/Meeting";
import type {Shooter} from "@gunsmith/engine/bullet/types/Shooter";

it("has no hits when there are no meetings", () => {
  expect(landedHitsOf([])).toEqual([]);
});

it("makes a hit on the opponent for each player's bullet that met the fighter", () => {
  expect(landedHitsOf([meeting("player", "fighter", undefined), meeting("player", "fighter", undefined)])).toEqual([
    {on: "opponent", dummyIndex: undefined},
    {on: "opponent", dummyIndex: undefined},
  ]);
});

it("makes a hit on a dummy, with which one, for each player's bullet that met a dummy", () => {
  expect(landedHitsOf([meeting("player", "dummy", 2), meeting("player", "dummy", 0)])).toEqual([
    {on: "dummy", dummyIndex: 2},
    {on: "dummy", dummyIndex: 0},
  ]);
});

it("keeps the order of the meetings", () => {
  expect(landedHitsOf([meeting("player", "dummy", 1), meeting("player", "fighter", undefined)])).toEqual([
    {on: "dummy", dummyIndex: 1},
    {on: "opponent", dummyIndex: undefined},
  ]);
});

it("leaves out the opponent's bullets, whatever they met", () => {
  expect(landedHitsOf([meeting("opponent", "fighter", undefined), meeting("opponent", "dummy", 0)])).toEqual([]);
});

it("leaves out bullets that met a wall or nothing", () => {
  expect(landedHitsOf([meeting("player", "wall", undefined), meeting("player", "none", undefined)])).toEqual([]);
});

it("leaves out a bullet that met a dummy but has no index to say which", () => {
  expect(landedHitsOf([meeting("player", "dummy", undefined)])).toEqual([]);
});

function meeting(shooter: Shooter, contact: Contact, dummyIndex: number | undefined): Meeting {
  const bullet: Bullet = {
    position: {x: 0, y: 0},
    direction: {x: 1, y: 0},
    damage: 25,
    speed: 20,
    shooter,
    level: 0,
    crouching: false,
  };

  return {bullet, contact, dummyIndex};
}
