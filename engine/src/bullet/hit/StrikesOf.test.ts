import {strikesOf} from "@gunsmith/engine/bullet/hit/StrikesOf";
import type {Bullet} from "@gunsmith/engine/bullet/types/Bullet";
import type {Contact} from "@gunsmith/engine/bullet/types/Contact";
import type {Meeting} from "@gunsmith/engine/bullet/types/Meeting";

it("has no strikes when there are no meetings", () => {
  expect(strikesOf([])).toEqual([]);
});

it("makes one strike for each bullet that landed on a dummy, with that bullet's own damage", () => {
  const meetings = [meeting("dummy", 0), meeting("dummy", 2, 50), meeting("dummy", 0, 10)];

  expect(strikesOf(meetings)).toEqual([
    {dummyIndex: 0, damage: 25},
    {dummyIndex: 2, damage: 50},
    {dummyIndex: 0, damage: 10},
  ]);
});

it("leaves out bullets that met a fighter, a wall or nothing", () => {
  const meetings = [meeting("fighter", undefined), meeting("wall", undefined), meeting("none", undefined)];

  expect(strikesOf(meetings)).toEqual([]);
});

it("strikes dummy zero, which is the first in the list", () => {
  expect(strikesOf([meeting("dummy", 0)])).toEqual([{dummyIndex: 0, damage: 25}]);
});

it("goes by what the bullet met, not by a dummy index alone", () => {
  expect(strikesOf([meeting("fighter", 1), meeting("none", 1)])).toEqual([]);
});

it("leaves out a bullet that met a dummy but has no index to say which", () => {
  expect(strikesOf([meeting("dummy", undefined)])).toEqual([]);
});

function meeting(contact: Contact, dummyIndex: number | undefined, damage = 25): Meeting {
  const bullet: Bullet = {
    position: {x: 0, y: 0},
    direction: {x: 1, y: 0},
    damage,
    speed: 20,
    shooter: "player",
    level: 0,
  };

  return {bullet, contact, dummyIndex};
}
