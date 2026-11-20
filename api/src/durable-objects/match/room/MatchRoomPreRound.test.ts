import {DUEL_BUILT_IN_ARENA} from "@gunsmith/engine/built-in-arenas/DuelBuiltInArena";
import {FAIR_DUEL_BUILT_IN_ARENA} from "@gunsmith/engine/built-in-arenas/FairDuelBuiltInArena";
import {MARKSMAN_RIFLE} from "@gunsmith/engine/weapon/weapons/MarksmanRifle";
import {RIFLE} from "@gunsmith/engine/weapon/weapons/Rifle";
import {SUBMACHINE_GUN} from "@gunsmith/engine/weapon/weapons/SubmachineGun";
import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {fairStart} from "@gunsmith/engine/arena-symmetry/FairStart";
import type {Seat} from "@gunsmith/engine/seat/types/Seat";
import type {Weapon} from "@gunsmith/engine/weapon/types/Weapon";
import type {WeaponKeys} from "@src/durable-objects/match/pre-round/types/WeaponKeys";
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
  room.preRoundAction("first", {kind: "lockInWeapons"});
  room.preRoundAction("second", {kind: "lockInWeapons"});

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

it("waits for both seats' weapons before it begins the match, though the arena is settled", () => {
  const room = twoSeatedRoom();

  room.preRoundAction("first", {kind: "lockInArena"});
  room.preRoundAction("second", {kind: "lockInArena"});
  room.preRoundAction("first", {kind: "lockInWeapons"});

  expect(room.snapshotFor("first")).toBeUndefined();
  expect(room.preRoundFor("first")).toMatchObject({
    stage: "choosing",
    own: {weapons: {locked: true}},
    opponent: {weapons: {locked: false}},
  });
});

it("starts each seat with the weapons it locked in, the first in hand", () => {
  const room = twoSeatedRoom();

  lockInWeapons(room, "first", ["submachine-gun", "rifle"]);
  lockInWeapons(room, "second", ["marksman-rifle", "marksman-rifle"]);
  lockInArena(room, "first", DUEL_BUILT_IN_ARENA.name);
  lockInArena(room, "second", DUEL_BUILT_IN_ARENA.name);

  expect(weaponsOf(room, "first")).toEqual([SUBMACHINE_GUN, RIFLE]);
  expect(weaponsOf(room, "second")).toEqual([MARKSMAN_RIFLE, MARKSMAN_RIFLE]);
  expect(room.snapshotFor("first")?.player).toMatchObject({equippedIndex: 0});
  expect(room.snapshotFor("first")?.player.loadout[0]).toEqual({
    weapon: SUBMACHINE_GUN,
    rounds: SUBMACHINE_GUN.magazineSize,
    reserve: SUBMACHINE_GUN.startingReserve,
  });
});

it("starts a seat that locked in without choosing with the rifle and the marksman rifle", () => {
  const room = new MatchRoom({preRoundSeconds: 0});
  room.join();
  room.join();

  expect(weaponsOf(room, "first")).toEqual([RIFLE, MARKSMAN_RIFLE]);
  expect(weaponsOf(room, "second")).toEqual([RIFLE, MARKSMAN_RIFLE]);
});

it("carries each seat's weapons into the next round", () => {
  const room = twoSeatedRoom({reconnectSeconds: 5, idleSeconds: 60});
  lockInWeapons(room, "first", ["submachine-gun", "rifle"]);
  lockInWeapons(room, "second", ["marksman-rifle", "submachine-gun"]);
  lockInArena(room, "first", DUEL_BUILT_IN_ARENA.name);
  lockInArena(room, "second", DUEL_BUILT_IN_ARENA.name);
  room.leave("first");
  stayActive(room, "second", 6);
  expect(room.snapshotFor("second")?.round).toBe("won");

  room.ready("first");
  room.ready("second");

  expect(room.snapshotFor("second")?.match?.roundNumber).toBe(2);
  expect(weaponsOf(room, "first")).toEqual([SUBMACHINE_GUN, RIFLE]);
  expect(weaponsOf(room, "second")).toEqual([MARKSMAN_RIFLE, SUBMACHINE_GUN]);
});

it("tells a seat the other's weapons only once both have locked in theirs", () => {
  const room = twoSeatedRoom();
  lockInWeapons(room, "second", ["submachine-gun", "rifle"]);

  expect(JSON.stringify(room.preRoundFor("first"))).not.toContain("submachine-gun");
  room.preRoundAction("first", {kind: "lockInWeapons"});

  expect(room.preRoundFor("first")?.opponent.weapons).toEqual({locked: true, keys: ["submachine-gun", "rifle"]});
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

/** `seat` asks for something new every second for `seconds`, so it is plainly there while the other seat is away. */
function stayActive(room: MatchRoom, seat: Seat, seconds: number): void {
  for (let second = 0; second < seconds; second += 1) {
    room.setInput(seat, {direction: {x: second % 2, y: 0}, firing: false, reload: false}, second + 1);
    room.tick(STEPS_IN_A_SECOND);
  }
}

function lockInWeapons(room: MatchRoom, seat: Seat, keys: WeaponKeys): void {
  room.preRoundAction(seat, {kind: "chooseWeapons", keys});
  room.preRoundAction(seat, {kind: "lockInWeapons"});
}

function weaponsOf(room: MatchRoom, seat: Seat): Weapon[] | undefined {
  return room.snapshotFor(seat)?.player.loadout.map(carried => carried.weapon);
}

/** The seat puts the arena forward and locks it in, and locks in its weapons too if it has not already (the defaults). */
function lockInArena(room: MatchRoom, seat: Seat, name: string): void {
  room.preRoundAction(seat, {kind: "chooseArena", name});
  room.preRoundAction(seat, {kind: "lockInArena"});
  room.preRoundAction(seat, {kind: "lockInWeapons"});
}
