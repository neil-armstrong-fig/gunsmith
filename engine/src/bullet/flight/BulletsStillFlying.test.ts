import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {bulletsStillFlying} from "@gunsmith/engine/bullet/flight/BulletsStillFlying";
import type {Bullet} from "@gunsmith/engine/bullet/types/Bullet";
import type {Contact} from "@gunsmith/engine/bullet/types/Contact";
import type {Meeting} from "@gunsmith/engine/bullet/types/Meeting";

describe("on open ground", () => {
  const open = arenaFrom(["############", ...Array<string>(4).fill("#..........#"), "############"]);

  it("keeps only the bullets that met nothing", () => {
    const meetings = [meeting("none"), meeting("wall"), meeting("dummy"), meeting("fighter")];

    expect(bulletsStillFlying(open, meetings, 0.05)).toHaveLength(1);
  });

  it("moves a bullet along its direction at its own speed", () => {
    const [moved] = bulletsStillFlying(open, [meeting("none", {direction: {x: 0, y: 1}, speed: 10})], 0.1);

    expect(moved?.position.x).toBe(1);
    expect(moved?.position.y).toBeCloseTo(3, 9);
  });

  it("keeps everything else about the bullet", () => {
    const [moved] = bulletsStillFlying(open, [meeting("none", {damage: 40, shooter: "opponent"})], 0.05);

    expect(moved).toMatchObject({damage: 40, shooter: "opponent", speed: 20, direction: {x: 1, y: 0}, floor: 0});
  });

  it("keeps the order of the bullets", () => {
    const meetings = [meeting("none", {position: {x: 1, y: 1}}), meeting("none", {position: {x: 1, y: 3}})];

    expect(bulletsStillFlying(open, meetings, 0.01).map(bullet => bullet.position.y)).toEqual([1, 3]);
  });
});

describe("between two platforms", () => {
  // A platform one level up at x 1 and 2, low ground at x 3 to 6, a second platform at x 7 and 8, and low ground at x 9 to 11.
  const twoPlatforms = arenaFrom(["#############", "#11....11...#", "#############"]);
  const FROM_THE_EDGE: Partial<Bullet> = {level: 1, floor: 0};

  it("raises the floor of a bullet that passes up from the low ground onto the second platform", () => {
    const [moved] = bulletsStillFlying(
      twoPlatforms,
      [meeting("none", {...FROM_THE_EDGE, position: {x: 6.2, y: 1.5}})],
      0.05,
    );

    expect(moved?.floor).toBe(1);
  });

  it("keeps the floor of a bullet that flies off the shooter's own platform and down over the low ground", () => {
    const [moved] = bulletsStillFlying(
      twoPlatforms,
      [meeting("none", {...FROM_THE_EDGE, position: {x: 1.2, y: 1.5}})],
      0.1,
    );

    expect(moved?.floor).toBe(0);
  });

  it("keeps the floor of a bullet that flies on over the low ground", () => {
    const [moved] = bulletsStillFlying(
      twoPlatforms,
      [meeting("none", {...FROM_THE_EDGE, position: {x: 3.2, y: 1.5}})],
      0.1,
    );

    expect(moved?.floor).toBe(0);
  });

  it("keeps the floor of a bullet already as high as the platform it passes onto", () => {
    const [moved] = bulletsStillFlying(
      twoPlatforms,
      [meeting("none", {...FROM_THE_EDGE, floor: 1, position: {x: 6.2, y: 1.5}})],
      0.05,
    );

    expect(moved?.floor).toBe(1);
  });
});

function meeting(contact: Contact, changes: Partial<Bullet> = {}): Meeting {
  const bullet: Bullet = {
    position: {x: 1, y: 2},
    direction: {x: 1, y: 0},
    damage: 25,
    speed: 20,
    shooter: "player",
    level: 0,
    crouching: false,
    floor: 0,
    ...changes,
  };

  return {bullet, contact, dummyIndex: undefined};
}
