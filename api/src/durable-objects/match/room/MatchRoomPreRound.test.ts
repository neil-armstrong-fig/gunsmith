import {DUEL_BUILT_IN_ARENA} from "@gunsmith/engine/built-in-arenas/DuelBuiltInArena";
import {FAIR_DUEL_BUILT_IN_ARENA} from "@gunsmith/engine/built-in-arenas/FairDuelBuiltInArena";
import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {fairStart} from "@gunsmith/engine/arena-symmetry/FairStart";
import {MatchRoom} from "@src/durable-objects/match/room/MatchRoom";

const STEPS_IN_A_SECOND = 60;

it("does not begin the match when the second seat sits: the seats choose first", () => {
  const room = twoSeatedRoom();

  expect(room.snapshotFor("first")).toBeUndefined();
  expect(room.preRoundFor("first")).toMatchObject({kind: "preRound", stage: "choosing", secondsLeft: 60});
});

it("begins the match on the duel arena once both seats have locked in having chosen nothing", () => {
  const room = twoSeatedRoom();

  room.preRoundAction("first", {kind: "lockInArena"});
  room.preRoundAction("second", {kind: "lockInArena"});

  expect(room.snapshotFor("first")).toBeDefined();
  expect(room.preRoundFor("first")).toBeUndefined();
  expect(room.joinedMessage("first").arena).toEqual(DUEL_BUILT_IN_ARENA.rows);
});

it("plays in the arena both seats put forward, and says so once so the browsers can swap it in", () => {
  const room = twoSeatedRoom();

  lockInArena(room, "first", FAIR_DUEL_BUILT_IN_ARENA.name);
  lockInArena(room, "second", FAIR_DUEL_BUILT_IN_ARENA.name);

  expect(room.joinedMessage("second").arena).toEqual(FAIR_DUEL_BUILT_IN_ARENA.rows);
  expect(room.takeArenaMessage()).toEqual({kind: "arena", rows: FAIR_DUEL_BUILT_IN_ARENA.rows});
  expect(room.takeArenaMessage()).toBeUndefined();
});

it("starts the fighters in the arena decided, on the places the fair start gives it", () => {
  const room = new MatchRoom({makeSeed: () => 7});
  room.join();
  room.join();
  lockInArena(room, "first", FAIR_DUEL_BUILT_IN_ARENA.name);
  lockInArena(room, "second", FAIR_DUEL_BUILT_IN_ARENA.name);

  const world = fairStart(arenaFrom(FAIR_DUEL_BUILT_IN_ARENA.rows), 7);

  expect(world).toBeDefined();
  expect(room.snapshotFor("first")?.player.position).toEqual(world?.player.position);
});

it("waits for the picks when the two seats put forward different arenas, then plays the one picked", () => {
  const room = twoSeatedRoom();
  lockInArena(room, "first", DUEL_BUILT_IN_ARENA.name);
  lockInArena(room, "second", FAIR_DUEL_BUILT_IN_ARENA.name);
  expect(room.snapshotFor("first")).toBeUndefined();

  room.preRoundAction("first", {kind: "pickArena", pick: {kind: "arena", seat: "second"}});
  room.preRoundAction("second", {kind: "pickArena", pick: {kind: "nothing"}});

  expect(room.joinedMessage("first").arena).toEqual(FAIR_DUEL_BUILT_IN_ARENA.rows);
  expect(room.snapshotFor("first")).toBeDefined();
});

it("lets a seat on its own choose and lock in for as long as it likes", () => {
  const room = new MatchRoom();
  room.join();
  room.preRoundAction("first", {kind: "chooseArena", name: FAIR_DUEL_BUILT_IN_ARENA.name});
  room.preRoundAction("first", {kind: "lockInArena"});

  room.tick(1000 * STEPS_IN_A_SECOND);

  expect(room.preRoundFor("first")).toMatchObject({stage: "choosing", own: {locked: true}});
  expect(room.preRoundFor("first")?.secondsLeft).toBeUndefined();
});

it("starts the clock when the second seat sits, and begins the match on the defaults when it runs out", () => {
  const room = twoSeatedRoom();
  room.preRoundAction("first", {kind: "chooseArena", name: FAIR_DUEL_BUILT_IN_ARENA.name});

  room.tick(59 * STEPS_IN_A_SECOND);
  expect(room.snapshotFor("first")).toBeUndefined();
  room.tick(STEPS_IN_A_SECOND);

  expect(room.snapshotFor("first")).toBeDefined();
  expect(room.joinedMessage("first").arena).toEqual(DUEL_BUILT_IN_ARENA.rows);
});

it("begins the match the moment the second seat sits when it is allowed no time to choose", () => {
  const room = new MatchRoom({preRoundSeconds: 0});

  room.join();
  room.join();

  expect(room.snapshotFor("first")).toBeDefined();
});

it("forgets what a seat chose when it leaves on its own, so whoever sits there next starts clean", () => {
  const room = new MatchRoom();
  room.join();
  room.preRoundAction("first", {kind: "chooseArena", name: FAIR_DUEL_BUILT_IN_ARENA.name});
  room.preRoundAction("first", {kind: "lockInArena"});

  room.leave("first");
  room.join();

  expect(room.preRoundFor("first")).toMatchObject({own: {locked: false}});
  expect(room.preRoundFor("first")?.own.arena).toBeUndefined();
});

it("keeps a seat once both have sat: a person who leaves can come back with their token, a stranger cannot take the seat", () => {
  const room = twoSeatedRoom();
  const token = room.joinedMessage("first").token;

  room.leave("first");

  expect(room.join()).toBeUndefined();
  expect(room.reconnect(token)).toBe("first");
});

it("starts the forfeit clocks only when the match does", () => {
  const room = twoSeatedRoom({reconnectSeconds: 5, idleSeconds: 5});
  room.leave("first");

  room.tick(20 * STEPS_IN_A_SECOND);
  expect(room.snapshotFor("second")).toBeUndefined();
  room.tick(40 * STEPS_IN_A_SECOND);
  room.tick(1);

  expect(room.snapshotFor("second")?.round).toBe("playing");
});

it("ignores a pre-round action once the match has begun", () => {
  const room = twoSeatedRoom();
  lockInArena(room, "first", DUEL_BUILT_IN_ARENA.name);
  lockInArena(room, "second", DUEL_BUILT_IN_ARENA.name);

  room.preRoundAction("first", {kind: "chooseArena", name: FAIR_DUEL_BUILT_IN_ARENA.name});

  expect(room.joinedMessage("first").arena).toEqual(DUEL_BUILT_IN_ARENA.rows);
});

function twoSeatedRoom(limits = {reconnectSeconds: 30, idleSeconds: 60}): MatchRoom {
  const room = new MatchRoom({limits});
  room.join();
  room.join();

  return room;
}

function lockInArena(room: MatchRoom, seat: "first" | "second", name: string): void {
  room.preRoundAction(seat, {kind: "chooseArena", name});
  room.preRoundAction(seat, {kind: "lockInArena"});
}
