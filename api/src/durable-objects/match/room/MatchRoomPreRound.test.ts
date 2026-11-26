import {DUEL_BUILT_IN_ARENA} from "@gunsmith/engine/built-in-arenas/DuelBuiltInArena";
import {FAIR_DUEL_BUILT_IN_ARENA} from "@gunsmith/engine/built-in-arenas/FairDuelBuiltInArena";
import {MARKSMAN_RIFLE} from "@gunsmith/engine/weapon/weapons/MarksmanRifle";
import {RIFLE} from "@gunsmith/engine/weapon/weapons/Rifle";
import {SUBMACHINE_GUN} from "@gunsmith/engine/weapon/weapons/SubmachineGun";
import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {fairStart} from "@gunsmith/engine/arena-symmetry/FairStart";
import type {Seat} from "@gunsmith/engine/seat/types/Seat";
import type {Weapon} from "@gunsmith/engine/weapon/types/Weapon";
import {fallbackAppearance} from "@gunsmith/shared/appearance/fallback/FallbackAppearance";
import type {ChosenWeapon} from "@src/durable-objects/match/pre-round/types/ChosenWeapon";
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
  lockInBothWeapons(room, "first");
  lockInBothWeapons(room, "second");

  expect(room.snapshotFor("first")).toBeDefined();
  expect(room.preRoundFor("first")).toBeUndefined();
  expect(room.joinedMessage("first").arena).toEqual(DUEL_BUILT_IN_ARENA.rows);
});

it("plays in the arena both seats put forward, and says so once so the browsers can swap it in", () => {
  const room = twoSeatedRoom();

  lockInArena(room, "first", FAIR_DUEL_BUILT_IN_ARENA.name);
  lockInArena(room, "second", FAIR_DUEL_BUILT_IN_ARENA.name);

  expect(room.joinedMessage("second").arena).toEqual(FAIR_DUEL_BUILT_IN_ARENA.rows);
  expect(room.takeArenaMessage("first")).toEqual({kind: "arena", rows: FAIR_DUEL_BUILT_IN_ARENA.rows});
  expect(room.takeArenaMessage("first")).toBeUndefined();
  expect(room.takeArenaMessage("second")).toEqual({kind: "arena", rows: FAIR_DUEL_BUILT_IN_ARENA.rows});
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
  lockInBothWeapons(room, "first");

  expect(room.snapshotFor("first")).toBeUndefined();
  expect(room.preRoundFor("first")).toMatchObject({
    stage: "choosing",
    own: {weapons: {slots: [{locked: true}, {locked: true}]}},
    opponent: {weapons: {slots: [{locked: false}, {locked: false}]}},
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

it("tells a seat the other's first weapon once both have locked in their first, and the second once both have locked in their second", () => {
  const room = twoSeatedRoom();
  lockInWeapons(room, "second", ["submachine-gun", "rifle"]);

  expect(JSON.stringify(room.preRoundFor("first"))).not.toContain("submachine-gun");
  room.preRoundAction("first", {kind: "lockInWeapon", slot: 1});

  expect(room.preRoundFor("first")?.opponent.weapons).toEqual({
    slots: [{locked: true, choice: {kind: "builtIn", key: "submachine-gun"}}, {locked: true}],
  });

  room.preRoundAction("first", {kind: "lockInWeapon", slot: 2});

  expect(room.preRoundFor("first")?.opponent.weapons.slots[1]).toEqual({
    locked: true,
    choice: {kind: "builtIn", key: "rifle"},
  });
});

it("does not let a seat lock in its second weapon before its first", () => {
  const room = twoSeatedRoom();

  room.preRoundAction("first", {kind: "lockInWeapon", slot: 2});

  expect(room.preRoundFor("first")?.own.weapons).toEqual({slots: [{locked: false}, {locked: false}]});
});

it("lets a seat on its own choose and lock in for as long as it likes", () => {
  const room = new MatchRoom();
  room.join();
  room.chooseArena("first", {kind: "builtIn", name: FAIR_DUEL_BUILT_IN_ARENA.name});
  room.preRoundAction("first", {kind: "lockInArena"});

  room.tick(1000 * STEPS_IN_A_SECOND);

  expect(room.preRoundFor("first")).toMatchObject({stage: "choosing", own: {locked: true}});
  expect(room.preRoundFor("first")?.secondsLeft).toBeUndefined();
});

it("starts the clock when the second seat sits, and begins the match on the defaults when it runs out", () => {
  const room = twoSeatedRoom();
  room.chooseArena("first", {kind: "builtIn", name: FAIR_DUEL_BUILT_IN_ARENA.name});

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
  room.chooseArena("first", {kind: "builtIn", name: FAIR_DUEL_BUILT_IN_ARENA.name});
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

  room.chooseArena("first", {kind: "builtIn", name: FAIR_DUEL_BUILT_IN_ARENA.name});

  expect(room.joinedMessage("first").arena).toEqual(DUEL_BUILT_IN_ARENA.rows);
});

it("sends each seat one reveal when the pre-round decides: the arena and both pairs of weapons, the other's saved one with its numbers and drawing", () => {
  const room = twoSeatedRoom();
  const sparky = savedWeapon("weapon-secret-1", "Sparky");
  lockInChosen(room, "first", [sparky, {kind: "builtIn", key: "rifle"}]);
  lockInWeapons(room, "second", ["submachine-gun", "marksman-rifle"]);
  lockInArena(room, "first", DUEL_BUILT_IN_ARENA.name);
  lockInArena(room, "second", DUEL_BUILT_IN_ARENA.name);

  const forSecond = room.takeRevealMessage("second");

  expect(forSecond).toEqual({
    kind: "reveal",
    arena: {name: DUEL_BUILT_IN_ARENA.name, rows: DUEL_BUILT_IN_ARENA.rows},
    weapons: {
      own: [
        {kind: "builtIn", key: "submachine-gun"},
        {kind: "builtIn", key: "marksman-rifle"},
      ],
      opponent: [
        {kind: "saved", weapon: weaponNamed("Sparky"), appearance: fallbackAppearance()},
        {kind: "builtIn", key: "rifle"},
      ],
    },
  });
  expect(JSON.stringify(forSecond)).not.toContain("secret");
});

it("sends a reveal once to each seat, and none before the match begins", () => {
  const room = twoSeatedRoom();

  expect(room.takeRevealMessage("first")).toBeUndefined();

  lockInArena(room, "first", DUEL_BUILT_IN_ARENA.name);
  lockInArena(room, "second", DUEL_BUILT_IN_ARENA.name);

  expect(room.takeRevealMessage("first")).toMatchObject({kind: "reveal"});
  expect(room.takeRevealMessage("first")).toBeUndefined();
  expect(room.takeRevealMessage("second")).toMatchObject({kind: "reveal"});
});

it("tells a seat the other's saved weapon in a slot once, with its numbers and drawing, when both have locked in that slot", () => {
  const room = twoSeatedRoom();
  room.chooseWeapon("second", 1, savedWeapon("weapon-secret-1", "Sparky"));
  room.preRoundAction("second", {kind: "lockInWeapon", slot: 1});

  const before = room.takeOpponentWeaponMessages("first");
  room.preRoundAction("first", {kind: "lockInWeapon", slot: 1});
  const after = room.takeOpponentWeaponMessages("first");

  expect(before).toEqual([]);
  expect(after).toEqual([
    {kind: "opponentWeapon", slot: 1, weapon: weaponNamed("Sparky"), appearance: fallbackAppearance()},
  ]);
  expect(JSON.stringify(after)).not.toContain("secret");
  expect(room.takeOpponentWeaponMessages("first")).toEqual([]);
});

it("never tells a seat its own saved weapon, nor a built-in, which its page has", () => {
  const room = twoSeatedRoom();
  room.chooseWeapon("second", 1, savedWeapon("weapon-1", "Sparky"));
  room.preRoundAction("second", {kind: "lockInWeapon", slot: 1});
  room.chooseWeapon("first", 1, {kind: "builtIn", key: "submachine-gun"});
  room.preRoundAction("first", {kind: "lockInWeapon", slot: 1});

  expect(room.takeOpponentWeaponMessages("second")).toEqual([]);
});

it("tells a seat that comes back before the match begins the other's saved weapons again, as its page may have lost them", () => {
  const room = twoSeatedRoom();
  const token = room.joinedMessage("first").token;
  room.chooseWeapon("second", 1, savedWeapon("weapon-1", "Sparky"));
  room.preRoundAction("second", {kind: "lockInWeapon", slot: 1});
  room.preRoundAction("first", {kind: "lockInWeapon", slot: 1});
  room.takeOpponentWeaponMessages("first");
  room.leave("first");

  expect(room.reconnect(token)).toBe("first");

  expect(room.takeOpponentWeaponMessages("first")).toMatchObject([{kind: "opponentWeapon", slot: 1}]);
  expect(room.takeOpponentWeaponMessages("first")).toEqual([]);
});

it("tells a seat nothing more of the other's weapons once the match has begun, since the reveal carries them", () => {
  const room = twoSeatedRoom();
  const token = room.joinedMessage("first").token;
  lockInChosen(room, "second", [savedWeapon("weapon-1", "Sparky"), {kind: "builtIn", key: "rifle"}]);
  lockInArena(room, "second", DUEL_BUILT_IN_ARENA.name);
  lockInArena(room, "first", DUEL_BUILT_IN_ARENA.name);
  room.takeOpponentWeaponMessages("first");
  room.leave("first");

  expect(room.reconnect(token)).toBe("first");

  expect(room.snapshotFor("first")).toBeDefined();
  expect(room.takeOpponentWeaponMessages("first")).toEqual([]);
});

it("plays a saved weapon in the match, and a saved arena as the arena", () => {
  const room = twoSeatedRoom();
  const sparky = savedWeapon("weapon-1", "Sparky");
  lockInChosen(room, "first", [sparky, {kind: "builtIn", key: "rifle"}]);
  room.chooseArena("first", {kind: "saved", id: "arena-1", arena: {name: "Little room", rows: littleRoom()}});
  room.preRoundAction("first", {kind: "lockInArena"});
  room.chooseArena("second", {kind: "saved", id: "arena-1", arena: {name: "Little room", rows: littleRoom()}});
  room.preRoundAction("second", {kind: "lockInArena"});
  lockInBothWeapons(room, "second");

  expect(room.takeArenaMessage("first")).toEqual({kind: "arena", rows: littleRoom()});
  expect(weaponsOf(room, "first")?.[0]).toEqual(weaponNamed("Sparky"));
});

it("holds a decided pre-round for the reveal: the arena and weapons are told at once, the match begins when the time is up", () => {
  const room = revealingRoom();

  expect(room.snapshotFor("first")).toBeUndefined();
  expect(room.preRoundFor("first")).toMatchObject({stage: "revealing", secondsLeft: 30, how: "same"});
  expect(room.joinedMessage("first").arena).toEqual(DUEL_BUILT_IN_ARENA.rows);
  expect(room.takeArenaMessage("first")).toEqual({kind: "arena", rows: DUEL_BUILT_IN_ARENA.rows});
  expect(room.takeRevealMessage("first")).toMatchObject({kind: "reveal"});

  room.tick(29 * STEPS_IN_A_SECOND);
  expect(room.snapshotFor("first")).toBeUndefined();
  room.tick(STEPS_IN_A_SECOND);

  expect(room.snapshotFor("first")).toBeDefined();
  expect(room.preRoundFor("first")).toBeUndefined();
});

it("begins the match from the reveal when both seats have asked to, and not when only one has", () => {
  const room = revealingRoom();

  room.ready("first");

  expect(room.snapshotFor("first")).toBeUndefined();
  expect(room.preRoundFor("second")?.opponent).toMatchObject({ready: true});

  room.ready("second");

  expect(room.snapshotFor("first")).toBeDefined();
});

it("starts the forfeit clocks only when the match begins, however long the reveal was", () => {
  const room = new MatchRoom({preRoundSeconds: 0, revealSeconds: 30, limits: {reconnectSeconds: 5, idleSeconds: 5}});
  room.join();
  room.join();

  room.tick(29 * STEPS_IN_A_SECOND);
  room.tick(STEPS_IN_A_SECOND);

  expect(room.snapshotFor("first")?.round).toBe("playing");
});

it("tells a seat that comes back during the reveal the arena and the reveal again", () => {
  const room = revealingRoom();
  const token = room.joinedMessage("first").token;
  room.takeArenaMessage("first");
  room.takeRevealMessage("first");
  room.leave("first");

  expect(room.reconnect(token)).toBe("first");

  expect(room.takeArenaMessage("first")).toEqual({kind: "arena", rows: DUEL_BUILT_IN_ARENA.rows});
  expect(room.takeRevealMessage("first")).toMatchObject({kind: "reveal"});
  expect(room.takeRevealMessage("first")).toBeUndefined();
});

it("ignores a go-on before the pre-round is decided", () => {
  const room = new MatchRoom({revealSeconds: 30});
  room.join();
  room.join();

  room.ready("first");
  room.ready("second");
  lockInArena(room, "first", DUEL_BUILT_IN_ARENA.name);
  lockInArena(room, "second", DUEL_BUILT_IN_ARENA.name);

  expect(room.snapshotFor("first")).toBeUndefined();
});

function revealingRoom(): MatchRoom {
  const room = new MatchRoom({revealSeconds: 30});
  room.join();
  room.join();
  lockInArena(room, "first", DUEL_BUILT_IN_ARENA.name);
  lockInArena(room, "second", DUEL_BUILT_IN_ARENA.name);

  return room;
}

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

function lockInWeapons(room: MatchRoom, seat: Seat, keys: readonly [string, string]): void {
  lockInChosen(room, seat, [
    {kind: "builtIn", key: keys[0]},
    {kind: "builtIn", key: keys[1]},
  ]);
}

/** The seat puts its first weapon forward and locks it in, then its second: the second can only be taken once the first is locked. */
function lockInChosen(room: MatchRoom, seat: Seat, chosen: readonly [ChosenWeapon, ChosenWeapon]): void {
  room.chooseWeapon(seat, 1, chosen[0]);
  room.preRoundAction(seat, {kind: "lockInWeapon", slot: 1});
  room.chooseWeapon(seat, 2, chosen[1]);
  room.preRoundAction(seat, {kind: "lockInWeapon", slot: 2});
}

function weaponsOf(room: MatchRoom, seat: Seat): Weapon[] | undefined {
  return room.snapshotFor(seat)?.player.loadout.map(carried => carried.weapon);
}

/** The seat puts the arena forward and locks it in, and locks in its weapons too if it has not already (the defaults). */
function lockInArena(room: MatchRoom, seat: Seat, name: string): void {
  room.chooseArena(seat, {kind: "builtIn", name});
  room.preRoundAction(seat, {kind: "lockInArena"});
  lockInBothWeapons(room, seat);
}

function lockInBothWeapons(room: MatchRoom, seat: Seat): void {
  room.preRoundAction(seat, {kind: "lockInWeapon", slot: 1});
  room.preRoundAction(seat, {kind: "lockInWeapon", slot: 2});
}

function savedWeapon(id: string, name: string): ChosenWeapon {
  return {kind: "saved", id, weapon: weaponNamed(name), appearance: fallbackAppearance()};
}

function weaponNamed(name: string): Weapon {
  return {...SUBMACHINE_GUN, identity: {key: "saved", name}};
}

function littleRoom(): readonly string[] {
  return ["########", "#......#", "#......#", "#......#", "########"];
}
