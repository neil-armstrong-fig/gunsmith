import {bulletsStillFlying} from "@gunsmith/engine/bullet/flight/BulletsStillFlying";
import type {Bullet} from "@gunsmith/engine/bullet/types/Bullet";
import type {Contact} from "@gunsmith/engine/bullet/types/Contact";
import type {Meeting} from "@gunsmith/engine/bullet/types/Meeting";

function meeting(contact: Contact, changes: Partial<Bullet> = {}): Meeting {
  const bullet: Bullet = {
    position: {x: 1, y: 2},
    direction: {x: 1, y: 0},
    damage: 25,
    speed: 20,
    shooter: "player",
    ...changes,
  };

  return {bullet, contact, dummyIndex: undefined};
}

it("keeps only the bullets that met nothing", () => {
  const meetings = [meeting("none"), meeting("wall"), meeting("dummy"), meeting("fighter")];

  expect(bulletsStillFlying(meetings, 0.05)).toHaveLength(1);
});

it("moves a bullet along its direction at its own speed", () => {
  const [moved] = bulletsStillFlying([meeting("none", {direction: {x: 0, y: 1}, speed: 10})], 0.1);

  expect(moved?.position.x).toBe(1);
  expect(moved?.position.y).toBeCloseTo(3, 9);
});

it("keeps everything else about the bullet", () => {
  const [moved] = bulletsStillFlying([meeting("none", {damage: 40, shooter: "opponent"})], 0.05);

  expect(moved).toMatchObject({damage: 40, shooter: "opponent", speed: 20, direction: {x: 1, y: 0}});
});

it("keeps the order of the bullets", () => {
  const meetings = [meeting("none", {position: {x: 1, y: 1}}), meeting("none", {position: {x: 1, y: 3}})];

  expect(bulletsStillFlying(meetings, 0.01).map(bullet => bullet.position.y)).toEqual([1, 3]);
});
