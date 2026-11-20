import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import type {Bullet} from "@gunsmith/engine/bullet/types/Bullet";
import {startingWorld} from "@gunsmith/engine/game-loop/StartingWorld";
import type {World} from "@gunsmith/engine/game-loop/types/World";
import {mirrorSeats} from "@gunsmith/engine/seat/mirroring/MirrorSeats";

const room = arenaFrom(["########", "#......#", "#......#", "########"]);

const BULLET: Bullet = {
  position: {x: 3.5, y: 1.5},
  direction: {x: 1, y: 0},
  damage: 1,
  speed: 1,
  shooter: "player",
  level: 0,
  crouching: false,
};

it("swaps the two fighters", () => {
  const world = duel();
  const mirrored = mirrorSeats(world);

  expect(mirrored.player).toEqual(world.opponent);
  expect(mirrored.opponent).toEqual(world.player);
});

it("gives each bullet to the other side", () => {
  expect(mirrorSeats(duel()).bullets[0]?.shooter).toBe("opponent");
});

it("turns the round's outcome and the score round", () => {
  const mirrored = mirrorSeats(duel());

  expect(mirrored.round).toBe("lost");
  expect(mirrored.match).toEqual({playerWins: 1, opponentWins: 2, roundNumber: 4});
});

it("turns a lost round into a won one", () => {
  expect(mirrorSeats({...duel(), round: "lost"}).round).toBe("won");
});

it("leaves a drawn round drawn, since it is the same for both seats", () => {
  expect(mirrorSeats({...duel(), round: "drawn"}).round).toBe("drawn");
});

it("leaves a round still being fought as it is", () => {
  expect(mirrorSeats({...duel(), round: "playing"}).round).toBe("playing");
});

it("gives each fighter's events to the other seat's side, so the second seat's are the player's", () => {
  const world: World = {...duel(), opponentEvents: [{kind: "pickupTaken"}]};
  const mirrored = mirrorSeats(world);

  expect(mirrored.events).toEqual([{kind: "pickupTaken"}]);
  expect(mirrored.opponentEvents).toEqual([{kind: "fireRefused", reason: "empty"}]);
});

it("has no events for the second seat when the opponent had none", () => {
  expect(mirrorSeats(duel()).events).toBeUndefined();
});

it("returns a world with no opponent as it is", () => {
  const alone = startingWorld(room);

  expect(mirrorSeats(alone)).toBe(alone);
});

it("is its own inverse", () => {
  const world = {...duel(), opponentEvents: [{kind: "pickupTaken" as const}], opponentBrain: undefined};

  expect(mirrorSeats(mirrorSeats(world))).toEqual(world);
});

function duel(): World {
  return {
    ...startingWorld(room, [], {x: 5.5, y: 1.5}),
    bullets: [BULLET],
    round: "won",
    match: {playerWins: 2, opponentWins: 1, roundNumber: 4},
    events: [{kind: "fireRefused", reason: "empty"}],
  };
}
