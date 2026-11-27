import {landedHitsOfOpponent} from "@gunsmith/engine/bullet/hit/LandedHitsOfOpponent";
import type {Bullet} from "@gunsmith/engine/bullet/types/Bullet";
import type {Contact} from "@gunsmith/engine/bullet/types/Contact";
import type {Meeting} from "@gunsmith/engine/bullet/types/Meeting";
import type {Shooter} from "@gunsmith/engine/bullet/types/Shooter";

it("has no hits when there are no meetings", () => {
  expect(landedHitsOfOpponent([])).toEqual([]);
});

it("makes a hit, on the other fighter as the opponent sees them, for each opponent's bullet that met a fighter", () => {
  expect(
    landedHitsOfOpponent([meeting("opponent", "fighter", undefined), meeting("opponent", "fighter", undefined)]),
  ).toEqual([
    {on: "opponent", dummyIndex: undefined},
    {on: "opponent", dummyIndex: undefined},
  ]);
});

it("leaves out the player's bullets, whatever they met", () => {
  expect(landedHitsOfOpponent([meeting("player", "fighter", undefined), meeting("player", "dummy", 0)])).toEqual([]);
});

it("leaves out bullets that met a wall, a dummy or nothing", () => {
  expect(
    landedHitsOfOpponent([
      meeting("opponent", "wall", undefined),
      meeting("opponent", "dummy", 1),
      meeting("opponent", "none", undefined),
    ]),
  ).toEqual([]);
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
    floor: 0,
  };

  return {bullet, contact, dummyIndex};
}
