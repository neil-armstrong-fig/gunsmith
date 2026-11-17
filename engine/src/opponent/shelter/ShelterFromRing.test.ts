import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {startingWorld} from "@gunsmith/engine/game-loop/StartingWorld";
import type {Input} from "@gunsmith/engine/game-loop/types/Input";
import type {Point} from "@gunsmith/engine/geometry/types/Point";
import {DIFFICULTY} from "@gunsmith/engine/opponent/Difficulty";
import {giveOpponentBrain} from "@gunsmith/engine/opponent/GiveOpponentBrain";
import {shelterFromRing} from "@gunsmith/engine/opponent/shelter/ShelterFromRing";
import type {OpponentContext} from "@gunsmith/engine/opponent/types/OpponentContext";
import type {StateAct} from "@gunsmith/engine/opponent/types/StateAct";
import type {Ring} from "@gunsmith/engine/ring/types/Ring";

const room = arenaFrom([
  "########################",
  "#......................#",
  "#......................#",
  "#......................#",
  "#......................#",
  "#......................#",
  "########################",
]);
const CENTRE: Point = {x: 12, y: 3};
const PLAYER_AT: Point = {x: 2.5, y: 1.5};
// Reaches 10 tiles from the centre until it starts at 10 s, then closes to 2 tiles by 30 s: 6 tiles at 20 s.
const ring: Ring = {
  roundSeconds: 20,
  centre: CENTRE,
  startRadius: 10,
  timing: {startDelaySeconds: 10, closingSeconds: 20},
};

it("changes nothing when there is no ring", () => {
  const act = actWith();

  expect(shelterFromRing(act, contextAt({x: 22.5, y: 3}, {ring: undefined}))).toEqual(act);
});

it("changes nothing before the ring has started to close, even far out", () => {
  const act = actWith();
  const notStarted = {...ring, roundSeconds: 5};

  expect(shelterFromRing(act, contextAt({x: 22.5, y: 3}, {ring: notStarted}))).toEqual(act);
});

it("changes nothing while it is as far inside the edge as the margin asks", () => {
  const act = actWith();

  // The ring is 6 tiles wide at 20 s and the margin is 2, so 4 tiles from the centre is the farthest out it stays.
  expect(shelterFromRing(act, contextAt({x: 16, y: 3}))).toEqual(act);
});

it("walks toward the centre once it is within the margin of the edge", () => {
  const nearEdge = contextAt({x: 16.5, y: 3});
  const sheltered = shelterFromRing(actWith(), nearEdge);

  expect(sheltered.input.direction.x).toBeCloseTo(-DIFFICULTY.speedShare, 9);
  expect(sheltered.input.direction.y).toBeCloseTo(0, 9);
});

it("walks toward the centre from outside the ring", () => {
  const sheltered = shelterFromRing(actWith(), contextAt({x: 22.5, y: 4}));
  const towards = {x: CENTRE.x - 22.5, y: CENTRE.y - 4};
  const length = Math.hypot(towards.x, towards.y);

  expect(sheltered.input.direction.x).toBeCloseTo((towards.x / length) * DIFFICULTY.speedShare, 9);
  expect(sheltered.input.direction.y).toBeCloseTo((towards.y / length) * DIFFICULTY.speedShare, 9);
});

it("keeps what the state asked for besides its walk, and its brain, while it sees the player", () => {
  const act = actWith({reload: true});
  const sheltered = shelterFromRing(act, contextAt({x: 22.5, y: 3}, {sees: true}));

  expect(sheltered.input.aimAt).toEqual({x: 5, y: 5});
  expect(sheltered.input.firing).toBe(true);
  expect(sheltered.input.reload).toBe(true);
  expect(sheltered.brain).toBe(act.brain);
});

it("looks where it walks when it does not see the player", () => {
  const sheltered = shelterFromRing(actWith(), contextAt({x: 22.5, y: 3}, {sees: false}));

  expect(sheltered.input.aimAt).toEqual(CENTRE);
});

it("asks for no walk once it has arrived at the centre", () => {
  const closed = {...ring, roundSeconds: 30};
  const sheltered = shelterFromRing(actWith(), contextAt({x: 12.1, y: 3}, {ring: closed}));

  expect(sheltered.input.direction).toEqual({x: 0, y: 0});
});

it("keeps the margin from the edge as the ring closes in on it", () => {
  const closed = {...ring, roundSeconds: 30};

  // The final radius is 2 tiles, less the margin of 2 leaves no safe ground to keep, so 3 tiles out it still walks in.
  expect(shelterFromRing(actWith(), contextAt({x: 15, y: 3}, {ring: closed})).input.direction.x).toBeLessThan(0);
});

it("walks round a pillar that stands between it and the centre rather than into it", () => {
  const pillared = arenaFrom([
    "####################",
    "#..................#",
    "#..................#",
    "#........##........#",
    "#........##........#",
    "#........##........#",
    "#..................#",
    "#..................#",
    "####################",
  ]);
  const behind = {...ring, centre: {x: 3.5, y: 4.5}};
  const sheltered = shelterFromRing(actWith(), {...contextAt({x: 14.5, y: 4.5}, {ring: behind}), arena: pillared});

  expect(sheltered.input.direction.x).toBeLessThan(0);
  expect(Math.abs(sheltered.input.direction.y)).toBeGreaterThan(0.1);
});

it("looks where it walks round the pillar, not at the centre behind it, when it does not see the player", () => {
  const pillared = arenaFrom([
    "####################",
    "#..................#",
    "#..................#",
    "#........##........#",
    "#........##........#",
    "#........##........#",
    "#..................#",
    "#..................#",
    "####################",
  ]);
  const behind = {...ring, centre: {x: 3.5, y: 4.5}};
  const sheltered = shelterFromRing(actWith(), {...contextAt({x: 14.5, y: 4.5}, {ring: behind}), arena: pillared});

  expect(sheltered.input.aimAt).not.toEqual(behind.centre);
  expect(sheltered.input.aimAt?.y).not.toBeCloseTo(4.5, 3);
});

// The low ground in the west, a platform one level up in the east, and a stair between them at column 16.
const terraced = arenaFrom([
  "########################",
  "#...............>111111#",
  "#................111111#",
  "########################",
]);

it("climbs toward the stair, not straight at the drop, when the ring's centre is on a platform", () => {
  const onThePlatform = {...ring, centre: {x: 22.5, y: 1.5}};
  const atTheFoot = {...contextAt({x: 16.5, y: 1.5}, {ring: onThePlatform}), arena: terraced};
  const sheltered = shelterFromRing(actWith(), atTheFoot);

  expect(sheltered.input.direction.x).toBeCloseTo(0, 9);
  expect(sheltered.input.direction.y).toBeCloseTo(DIFFICULTY.speedShare, 9);
  expect(sheltered.input.aimAt).toEqual({x: 16.5, y: 2.5});
});

it("goes round to the stair to come down when the ring's centre is on the low ground", () => {
  const onTheLow = {...ring, centre: {x: 3.5, y: 1.5}};
  const onThePlatform = {...contextAt({x: 17.5, y: 1.5}, {ring: onTheLow}), arena: terraced};
  const sheltered = shelterFromRing(actWith(), onThePlatform);

  expect(sheltered.input.direction.x).toBeCloseTo(0, 9);
  expect(sheltered.input.direction.y).toBeCloseTo(DIFFICULTY.speedShare, 9);
});

it("still walks straight at the centre across the platform it is already on", () => {
  const onThePlatform = {...ring, centre: {x: 22.5, y: 2.5}};
  const sheltered = shelterFromRing(actWith(), {
    ...contextAt({x: 17.5, y: 2.5}, {ring: onThePlatform}),
    arena: terraced,
  });

  expect(sheltered.input.direction.x).toBeCloseTo(DIFFICULTY.speedShare, 9);
  expect(sheltered.input.direction.y).toBeCloseTo(0, 9);
});

function actWith(overrides: Partial<Input> = {}): StateAct {
  const brain = giveOpponentBrain(startingWorld(room, [], {x: 20, y: 3}), 1).opponentBrain;
  if (!brain) {
    throw new Error("The opponent has no brain.");
  }

  return {
    input: {direction: {x: -0.7, y: 0.1}, aimAt: {x: 5, y: 5}, firing: true, reload: false, ...overrides},
    brain,
  };
}

function contextAt(position: Point, overrides: Partial<OpponentContext> = {}): OpponentContext {
  const world = startingWorld(room, [], position);
  if (!world.opponent) {
    throw new Error("The world has no opponent.");
  }

  return {
    arena: room,
    opponent: world.opponent,
    target: {...world.player, position: PLAYER_AT},
    sees: false,
    seconds: 1 / 60,
    ring,
    ...overrides,
  };
}
