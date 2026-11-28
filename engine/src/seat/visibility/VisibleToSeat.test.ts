import type {Bullet} from "@gunsmith/engine/bullet/types/Bullet";
import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {startingWorld} from "@gunsmith/engine/game-loop/StartingWorld";
import type {World} from "@gunsmith/engine/game-loop/types/World";
import {visibleToSeat} from "@gunsmith/engine/seat/visibility/VisibleToSeat";
import {RIFLE} from "@gunsmith/engine/weapon/weapons/Rifle";

// The first seat starts at (12.5, 3.5) facing east, the second wherever the test puts it, facing west.
const room = arenaFrom([
  "########################",
  ...Array(5).fill("#" + ".".repeat(22) + "#"),
  "########################",
]);

it("shows the first seat an opponent in front of it, as the player's view does", () => {
  const world = startingWorld(room, [], {x: 12.5 + 4, y: 3.5});

  expect(visibleToSeat(world, "first").opponent).toBe(true);
});

it("shows the second seat the first when the second faces it", () => {
  const world = startingWorld(room, [], {x: 12.5 + 4, y: 3.5});

  expect(visibleToSeat(world, "second").opponent).toBe(true);
});

it("hides the first seat from the second when the second turns its back", () => {
  const world = startingWorld(room, [], {x: 12.5 + 4, y: 3.5});
  const turnedAway: World = {...world, opponent: world.opponent && {...world.opponent, aim: {x: 1, y: 0}}};

  expect(visibleToSeat(turnedAway, "second").opponent).toBe(false);
  expect(visibleToSeat(turnedAway, "first").opponent).toBe(true);
});

it("hides the first seat from the second beyond the second's weapon range", () => {
  const world = startingWorld(room, [], {x: 12.5 + RIFLE.visionRange + 0.5, y: 3.5});

  expect(visibleToSeat(world, "second").opponent).toBe(false);
});

it("shows a seat its own bullets, and the other seat's only where it sees", () => {
  const world = startingWorld(room, [], {x: 12.5 + 4, y: 3.5});
  const ownBullet: Bullet = {
    position: {x: 20.5, y: 1.5},
    direction: {x: 1, y: 0},
    damage: 1,
    speed: 1,
    shooter: "opponent",
    level: 0,
    crouching: false,
    floor: 0,
  };
  const withBullet: World = {...world, bullets: [ownBullet]};

  expect(visibleToSeat(withBullet, "second").bullets).toEqual([true]);
});

it("shows the second seat nothing when there is no second fighter", () => {
  const alone = startingWorld(room);

  expect(visibleToSeat(alone, "second")).toEqual({opponent: false, pickup: false, dummies: [], bullets: []});
});
