import {damageDealtBy} from "@gunsmith/engine/bullet/hit/DamageDealtBy";
import type {Bullet} from "@gunsmith/engine/bullet/types/Bullet";
import type {Contact} from "@gunsmith/engine/bullet/types/Contact";
import type {Meeting} from "@gunsmith/engine/bullet/types/Meeting";

function meeting(contact: Contact, changes: Partial<Bullet> = {}): Meeting {
  const bullet: Bullet = {
    position: {x: 0, y: 0},
    direction: {x: 1, y: 0},
    damage: 25,
    speed: 20,
    shooter: "player",
    ...changes,
  };

  return {bullet, contact, dummyIndex: undefined};
}

it("is zero when there are no meetings", () => {
  expect(damageDealtBy([], "player")).toBe(0);
});

it("adds up the damage of the shooter's bullets that landed on a fighter", () => {
  const meetings = [meeting("fighter"), meeting("fighter", {damage: 50})];

  expect(damageDealtBy(meetings, "player")).toBe(75);
});

it("leaves out the other shooter's bullets", () => {
  const meetings = [meeting("fighter"), meeting("fighter", {shooter: "opponent", damage: 50})];

  expect(damageDealtBy(meetings, "player")).toBe(25);
  expect(damageDealtBy(meetings, "opponent")).toBe(50);
});

it("leaves out bullets that met a dummy, a wall or nothing", () => {
  const meetings = [meeting("dummy"), meeting("wall"), meeting("none")];

  expect(damageDealtBy(meetings, "player")).toBe(0);
});
