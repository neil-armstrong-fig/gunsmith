import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import type {Bullet} from "@gunsmith/engine/bullet/types/Bullet";
import {startingWorld} from "@gunsmith/engine/game-loop/StartingWorld";
import type {World} from "@gunsmith/engine/game-loop/types/World";
import {giveOpponentBrain} from "@gunsmith/engine/opponent/GiveOpponentBrain";
import {viewOfSeat} from "@gunsmith/engine/seat/ViewOfSeat";

// The first seat starts at (12.5, 3.5) facing east and the second 4 tiles east of it facing west, on one clear row.
const room = arenaFrom([
  "########################",
  ...Array(5).fill("#" + ".".repeat(22) + "#"),
  "########################",
]);

it("tells a seat its own fighter in full", () => {
  const world = duel();

  expect(viewOfSeat(world, "first").player).toEqual(world.player);
  expect(viewOfSeat(world, "second").player).toEqual(world.opponent);
});

it("tells a seat about the other fighter when it sees them", () => {
  const world = duel();

  expect(viewOfSeat(world, "first").opponent).toEqual(world.opponent);
  expect(viewOfSeat(world, "second").opponent).toEqual(world.player);
});

it("leaves the other fighter out when the seat has its back to them", () => {
  const world = duel();
  const turnedAway: World = {...world, player: {...world.player, aim: {x: -1, y: 0}}};

  expect(viewOfSeat(turnedAway, "first").opponent).toBeUndefined();
  expect("opponent" in JSON.parse(JSON.stringify(viewOfSeat(turnedAway, "first")))).toBe(false);
  expect(viewOfSeat(turnedAway, "second").opponent).toEqual(turnedAway.player);
});

it("leaves the other fighter out when a wall is in the way", () => {
  const walled = arenaFrom([
    "########################",
    ...Array(5).fill("#" + ".".repeat(14) + "#" + ".".repeat(7) + "#"),
    "########################",
  ]);
  const world = startingWorld(walled, [], {x: 20.5, y: 3.5});

  expect(viewOfSeat(world, "first").opponent).toBeUndefined();
  expect(viewOfSeat(world, "second").opponent).toBeUndefined();
});

it("tells a seat its own side's bullets, and the other side's only where it sees", () => {
  const world: World = {...duel(), bullets: [shot("player", 13.5), shot("opponent", 14.5), shot("opponent", 2.5)]};

  expect(viewOfSeat(world, "first").bullets.map(bullet => bullet.position.x)).toEqual([13.5, 14.5]);
  expect(viewOfSeat(world, "second").bullets.map(bullet => bullet.position.x)).toEqual([13.5, 14.5, 2.5]);
});

it("tells a seat the round from its own side", () => {
  const won: World = {...duel(), round: "won", match: {playerWins: 1, opponentWins: 0, roundNumber: 1}};

  expect(viewOfSeat(won, "first").round).toBe("won");
  expect(viewOfSeat(won, "second").round).toBe("lost");
  expect(viewOfSeat(won, "second").match).toEqual({playerWins: 0, opponentWins: 1, roundNumber: 1});
});

it("never tells a seat the brain, the events or the dummies: sent as JSON, only what it may know is there", () => {
  const withSecrets = giveOpponentBrain(
    {...duel(), dummies: [{position: {x: 3.5, y: 3.5}, health: 5}], events: [{kind: "fireRefused", reason: "empty"}]},
    7,
  );
  const sent = JSON.parse(JSON.stringify(viewOfSeat(withSecrets, "first"))) as object;

  expect(Object.keys(sent).sort()).toEqual(["bullets", "elapsedSeconds", "opponent", "player", "round"]);
});

it("never tells either seat where a shot that hurt the opponent came from, which its brain remembers", () => {
  const brained = giveOpponentBrain(duel(), 7);
  const remembering = {
    ...brained,
    opponentBrain: brained.opponentBrain && {...brained.opponentBrain, shotFrom: {x: 88.125, y: 77.375}},
  };

  for (const seat of ["first", "second"] as const) {
    const sent = JSON.stringify(viewOfSeat(remembering, seat));

    expect(sent).not.toContain("shotFrom");
    expect(sent).not.toContain("88.125");
    expect(sent).not.toContain("77.375");
  }
});

function shot(shooter: Bullet["shooter"], x: number): Bullet {
  return {position: {x, y: 3.5}, direction: {x: 1, y: 0}, damage: 1, speed: 1, shooter, level: 0};
}

function duel(): World {
  return startingWorld(room, [], {x: 12.5 + 4, y: 3.5});
}
