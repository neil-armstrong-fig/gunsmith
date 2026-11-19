import {DUEL_BUILT_IN_ARENA} from "@gunsmith/engine/built-in-arenas/DuelBuiltInArena";
import type {Input} from "@gunsmith/engine/game-loop/types/Input";
import type {Seat} from "@gunsmith/engine/seat/types/Seat";
import {MatchRoom} from "@src/durable-objects/match/room/MatchRoom";

const IDLE: Input = {direction: {x: 0, y: 0}, firing: false, reload: false};

/** The longest a seat shooting a standing fighter is given to decide a round: far more than the rifle needs. */
const MOST_STEPS_TO_DECIDE_A_ROUND = 1200;

const STEPS_PER_SECOND = 60;

it("seats the first person first and the second second, and nobody after", () => {
  const room = new MatchRoom();

  expect(room.join()).toBe("first");
  expect(room.join()).toBe("second");
  expect(room.join()).toBeUndefined();
});

it("gives a seat back when its person leaves before the match begins", () => {
  const room = new MatchRoom();
  const first = room.join();
  if (!first) {
    throw new Error("no seat");
  }

  room.leave(first);

  expect(room.join()).toBe("first");
});

it("keeps a seat once the match has begun: a person who leaves cannot be replaced by a stranger", () => {
  const room = startedRoom();

  room.leave("first");

  expect(room.join()).toBeUndefined();
});

it("tells each seat a token of its own as it sits down, which only that seat is given", () => {
  const room = startedRoom();
  const first = room.joinedMessage("first").token;
  const second = room.joinedMessage("second").token;

  expect(first).not.toBe("");
  expect(second).not.toBe("");
  expect(first).not.toBe(second);
});

it("gives a seat back to the person holding its token, but never to a stranger", () => {
  const room = startedRoom();
  const token = room.joinedMessage("first").token;
  room.leave("first");

  expect(room.reconnect("not-the-token")).toBeUndefined();
  expect(room.reconnect("")).toBeUndefined();
  expect(room.join()).toBeUndefined();
  expect(room.reconnect(token)).toBe("first");
});

it("lets the token of a seat that is still held take it over, as a page that reloads before the old connection is noticed gone", () => {
  const room = startedRoom();

  expect(room.reconnect(room.joinedMessage("second").token)).toBe("second");
});

it("has no token for a seat that was given back before the match began", () => {
  const room = new MatchRoom();
  room.join();
  const token = room.joinedMessage("first").token;
  room.leave("first");
  room.join();
  room.join();

  expect(room.reconnect(token)).toBeUndefined();
});

it("freezes a fighter whose person has left, where it stood", () => {
  const room = startedRoom();
  const start = room.snapshotFor("first")?.player.position;
  room.setInput("first", {...IDLE, direction: {x: 1, y: 0}}, 1);
  room.tick(10);
  const leftAt = room.snapshotFor("first")?.player.position;
  room.leave("first");
  room.tick(60);

  expect(leftAt?.x).toBeGreaterThan(start?.x ?? Infinity);
  expect(room.snapshotFor("first")?.player.position).toEqual(leftAt);
});

it("plays what a returning person asks for even though their count of inputs starts again from nothing", () => {
  const room = startedRoom();
  const token = room.joinedMessage("first").token;
  room.setInput("first", IDLE, 500);
  room.tick();
  room.leave("first");
  room.reconnect(token);

  expect(room.snapshotFor("first")?.ack).toBeUndefined();

  const before = room.snapshotFor("first")?.player.position;
  room.setInput("first", {...IDLE, direction: {x: 1, y: 0}}, 0);
  room.tick(10);

  expect(room.snapshotFor("first")?.ack).toEqual({seq: 0, held: 10});
  expect(room.snapshotFor("first")?.player.position.x).toBeGreaterThan(before?.x ?? Infinity);
});

it("keeps a seat's ask to go on across its person leaving and returning", () => {
  const room = startedRoom();
  const token = room.joinedMessage("first").token;
  winRound(room, "second");
  room.ready("first");
  room.leave("first");
  room.reconnect(token);

  expect(room.snapshotFor("second")?.ready).toEqual({player: false, opponent: true});
});

it("sends a seat nothing until both seats are taken", () => {
  const room = new MatchRoom();
  room.join();

  expect(room.snapshotFor("first")).toBeUndefined();
});

it("sends each seat a snapshot once both are seated, each from its own side", () => {
  const room = startedRoom();
  const first = room.snapshotFor("first");
  const second = room.snapshotFor("second");

  expect(first?.kind).toBe("snapshot");
  expect(first?.player.position).not.toEqual(second?.player.position);
});

it("tells a seat about the other fighter only while it can see them", () => {
  const room = startedRoom();
  const toFace = room.snapshotFor("second")?.player.position;
  if (!toFace) {
    throw new Error("the second seat has no fighter");
  }

  room.setInput("first", {...IDLE, aimAt: toFace}, 0);
  room.tick();
  expect(room.snapshotFor("first")?.opponent).toBeDefined();

  room.setInput("first", {...IDLE, aimAt: {x: 1.5, y: 6.5}}, 0);
  room.tick();
  expect(room.snapshotFor("first")?.opponent).toBeUndefined();
});

it("plays each seat by its own input", () => {
  const room = startedRoom();
  const before = room.snapshotFor("second")?.player.position;

  room.setInput("second", {...IDLE, direction: {x: 0, y: 1}}, 0);
  room.tick();

  expect(room.snapshotFor("second")?.player.position.y).toBeGreaterThan(before?.y ?? Infinity);
  expect(room.snapshotFor("first")?.player.position.y).toBe(6.5);
});

it("plays the steps it is told, so a late clock can catch up", () => {
  const walkingNorth: Input = {...IDLE, direction: {x: 0, y: 1}};
  const slow = startedRoom();
  const caughtUp = startedRoom();

  slow.setInput("second", walkingNorth, 0);
  slow.tick(1);
  caughtUp.setInput("second", walkingNorth, 0);
  caughtUp.tick(3);

  const slowY = slow.snapshotFor("second")?.player.position.y ?? 0;
  const caughtUpY = caughtUp.snapshotFor("second")?.player.position.y ?? 0;

  expect(caughtUpY - 6.5).toBeCloseTo(3 * (slowY - 6.5), 6);
});

it("plays no step for none owed", () => {
  const room = startedRoom();
  const before = room.snapshotFor("first")?.elapsedSeconds;

  room.tick(0);

  expect(room.snapshotFor("first")?.elapsedSeconds).toBe(before);
});

it("applies a reload or a weapon switch once, not every snapshot", () => {
  const room = startedRoom();

  room.setInput("first", {...IDLE, reload: true, switchTo: 2}, 0);
  room.tick();
  const afterTheFirst = room.snapshotFor("first")?.player.equippedIndex;
  room.setInput("first", {...IDLE}, 0);
  room.tick();

  expect(afterTheFirst).toBe(1);
  expect(room.snapshotFor("first")?.player.equippedIndex).toBe(1);
});

it("keeps a weapon switch a later input in the same snapshot did not repeat", () => {
  const room = startedRoom();

  room.setInput("first", {...IDLE, switchTo: 2}, 0);
  room.setInput("first", {...IDLE}, 0);
  room.tick();

  expect(room.snapshotFor("first")?.player.equippedIndex).toBe(1);
});

it("does not step a match that has not begun", () => {
  const room = new MatchRoom();
  room.join();
  room.tick();

  expect(room.snapshotFor("first")).toBeUndefined();
});

it("tells a seat the arena it plays in, the engine's duel arena", () => {
  expect(new MatchRoom().joinedMessage("second")).toEqual(
    expect.objectContaining({kind: "joined", seat: "second", arena: DUEL_BUILT_IN_ARENA.rows}),
  );
});

it("tells a seat which of its inputs the server last received, and how many steps have been played with it since", () => {
  const room = startedRoom();

  room.setInput("first", IDLE, 7);
  room.tick(2);
  room.tick(1);

  expect(room.snapshotFor("first")?.ack).toEqual({seq: 7, held: 3});
  expect(room.snapshotFor("second")?.ack).toBeUndefined();
});

it("starts counting the steps again when a newer input arrives", () => {
  const room = startedRoom();

  room.setInput("first", IDLE, 7);
  room.tick(4);
  room.setInput("first", IDLE, 9);
  room.tick(1);

  expect(room.snapshotFor("first")?.ack).toEqual({seq: 9, held: 1});
});

it("ignores an input older than one it already has", () => {
  const room = startedRoom();

  room.setInput("first", {...IDLE, direction: {x: 0, y: 1}}, 9);
  room.setInput("first", {...IDLE, direction: {x: 0, y: -1}}, 8);
  room.tick();

  expect(room.snapshotFor("first")?.ack?.seq).toBe(9);
  expect(room.snapshotFor("first")?.player.position.y).toBeGreaterThan(6.5);
});

it("keeps a reload asked on a tick that owed no step until a step plays it", () => {
  const room = startedRoom();

  room.setInput("first", {...IDLE, switchTo: 2}, 1);
  room.tick(0);
  room.tick(1);

  expect(room.snapshotFor("first")?.player.equippedIndex).toBe(1);
});

it("plays a click that was pressed and released between two ticks", () => {
  const room = startedRoom();
  const rounds = room.snapshotFor("first")?.player.loadout[0]?.rounds ?? 0;

  room.setInput("first", {...IDLE, firing: true}, 1);
  room.setInput("first", {...IDLE, firing: false}, 2);
  room.tick();

  expect(room.snapshotFor("first")?.player.loadout[0]?.rounds).toBe(rounds - 1);
});

it("does not play a click again on the ticks after it", () => {
  const room = startedRoom();
  const rounds = room.snapshotFor("first")?.player.loadout[0]?.rounds ?? 0;

  room.setInput("first", {...IDLE, firing: true}, 1);
  room.setInput("first", {...IDLE, firing: false}, 2);
  room.tick(1);
  room.tick(3);

  expect(room.snapshotFor("first")?.player.loadout[0]?.rounds).toBe(rounds - 1);
});

it("begins a match at nothing to nothing, in its first round", () => {
  const room = startedRoom();

  expect(room.snapshotFor("first")?.match).toEqual({playerWins: 0, opponentWins: 0, roundNumber: 1});
  expect(room.snapshotFor("second")?.match).toEqual({playerWins: 0, opponentWins: 0, roundNumber: 1});
});

it("scores a decided round for each seat from its own side", () => {
  const room = startedRoom();

  winRound(room, "first");

  expect(room.snapshotFor("first")?.round).toBe("won");
  expect(room.snapshotFor("first")?.match).toEqual({playerWins: 1, opponentWins: 0, roundNumber: 1});
  expect(room.snapshotFor("second")?.round).toBe("lost");
  expect(room.snapshotFor("second")?.match).toEqual({playerWins: 0, opponentWins: 1, roundNumber: 1});
});

it("does not begin the next round while only one seat has asked for it", () => {
  const room = startedRoom();
  winRound(room, "first");

  room.ready("first");
  room.tick();

  expect(room.snapshotFor("first")?.round).toBe("won");
  expect(room.snapshotFor("second")?.round).toBe("lost");
  expect(room.snapshotFor("first")?.ready).toEqual({player: true, opponent: false});
  expect(room.snapshotFor("second")?.ready).toEqual({player: false, opponent: true});
});

it("begins the next round when both seats have asked for it: the score kept, both fighters restored", () => {
  const room = startedRoom();
  winRound(room, "first");

  room.ready("first");
  room.ready("second");

  expect(room.snapshotFor("first")?.round).toBe("playing");
  expect(room.snapshotFor("second")?.round).toBe("playing");
  expect(room.snapshotFor("first")?.match).toEqual({playerWins: 1, opponentWins: 0, roundNumber: 2});
  expect(room.snapshotFor("second")?.match).toEqual({playerWins: 0, opponentWins: 1, roundNumber: 2});
  expect(room.snapshotFor("second")?.player.health).toBe(room.snapshotFor("first")?.player.health);
  expect(room.snapshotFor("first")?.player.position).toEqual({x: 10.5, y: 6.5});
  expect(room.snapshotFor("first")?.ready).toEqual({player: false, opponent: false});
});

it("ignores a seat asking to go on while the round is being fought, so it cannot ask ahead", () => {
  const room = startedRoom();

  room.ready("first");
  room.ready("second");

  expect(room.snapshotFor("first")?.match?.roundNumber).toBe(1);

  winRound(room, "first");

  expect(room.snapshotFor("first")?.ready).toEqual({player: false, opponent: false});
});

it("begins a fresh match when both seats ask to go on after the match is decided", () => {
  const room = startedRoom();
  winRound(room, "first");
  room.ready("first");
  room.ready("second");
  winRound(room, "first");

  expect(room.snapshotFor("first")?.match).toEqual({playerWins: 2, opponentWins: 0, roundNumber: 2});

  room.ready("first");
  room.ready("second");

  expect(room.snapshotFor("first")?.round).toBe("playing");
  expect(room.snapshotFor("first")?.match).toEqual({playerWins: 0, opponentWins: 0, roundNumber: 1});
  expect(room.snapshotFor("second")?.match).toEqual({playerWins: 0, opponentWins: 0, roundNumber: 1});
});

it("keeps what a seat asked for once the round is decided from being played in the next round", () => {
  const room = startedRoom();
  winRound(room, "first");
  room.setInput("first", {...IDLE, reload: true, switchTo: 2}, 5);

  room.ready("first");
  room.ready("second");
  room.tick();

  expect(room.snapshotFor("first")?.player.equippedIndex).toBe(0);
});

it("forfeits the round to the other seat when a seat's person has been away for the reconnect window", () => {
  const room = startedRoom();
  room.leave("first");

  playSeconds(room, 29.5);

  expect(room.snapshotFor("second")?.round).toBe("playing");

  playSeconds(room, 1);

  expect(room.snapshotFor("second")?.round).toBe("won");
  expect(room.snapshotFor("second")?.match).toEqual({playerWins: 1, opponentWins: 0, roundNumber: 1});
  expect(room.snapshotFor("first")?.round).toBe("lost");
  expect(room.snapshotFor("first")?.match).toEqual({playerWins: 0, opponentWins: 1, roundNumber: 1});
});

it("forfeits to the first seat when it is the second seat's person who has been away", () => {
  const room = startedRoom();
  room.leave("second");

  playSeconds(room, 31);

  expect(room.snapshotFor("first")?.round).toBe("won");
});

it("keeps the round for a person who comes back inside the window, and starts the window afresh when they leave again", () => {
  const room = startedRoom();
  const token = room.joinedMessage("first").token;
  room.leave("first");
  playSecondsAsking(room, "second", 25);
  room.reconnect(token);
  playSecondsAsking(room, "second", 20);
  room.leave("first");
  playSecondsAsking(room, "second", 25);

  expect(room.snapshotFor("second")?.round).toBe("playing");
});

it("waits as long as the room was made to wait", () => {
  const room = new MatchRoom({reconnectSeconds: 2, idleSeconds: 3});
  room.join();
  room.join();
  room.leave("first");

  playSeconds(room, 1.9);

  expect(room.snapshotFor("second")?.round).toBe("playing");

  playSeconds(room, 0.2);

  expect(room.snapshotFor("second")?.round).toBe("won");
});

it("forfeits the round of a seat that is there but has asked for nothing new for the idle time, the other seat being active", () => {
  const room = startedRoom();

  for (let second = 0; second < 59; second += 1) {
    askSomethingNew(room, "second", second);
    playSeconds(room, 1);
  }

  expect(room.snapshotFor("second")?.round).toBe("playing");

  askSomethingNew(room, "second", 59);
  playSeconds(room, 2);

  expect(room.snapshotFor("second")?.round).toBe("won");
  expect(room.snapshotFor("first")?.round).toBe("lost");
  expect(room.snapshotFor("first")?.match).toEqual({playerWins: 0, opponentWins: 1, roundNumber: 1});
});

it("does not count the same ask sent again as a sign the person is there", () => {
  const room = startedRoom();

  for (let second = 0; second < 70; second += 1) {
    askSomethingNew(room, "second", second);
    if (second % 5 === 0) {
      repeatTheAsk(room, "first");
    }
    playSeconds(room, 1);
  }

  expect(room.snapshotFor("second")?.round).toBe("won");
});

it("counts a changed ask as a sign the person is there, however seldom", () => {
  const room = startedRoom();
  let firstAsks = 0;

  for (let second = 0; second < 70; second += 1) {
    askSomethingNew(room, "second", second);
    if (second % 50 === 0) {
      askSomethingNew(room, "first", firstAsks);
      firstAsks += 1;
    }
    playSeconds(room, 1);
  }

  // The first seat last changed its ask at 50 s and the second every second, so the first would be the quiet one, but not before 110 s.
  expect(room.snapshotFor("second")?.round).toBe("playing");
});

it("forfeits nothing when both seats are quiet together", () => {
  const room = startedRoom();

  playSeconds(room, 200);

  expect(room.snapshotFor("first")?.round).toBe("playing");
  expect(room.snapshotFor("first")?.match).toEqual({playerWins: 0, opponentWins: 0, roundNumber: 1});
});

it("forfeits nothing when both seats are away together", () => {
  const room = startedRoom();
  room.leave("first");
  room.leave("second");

  playSeconds(room, 100);

  expect(room.snapshotFor("first")?.round).toBe("playing");
});

it("runs no clock before the match has begun", () => {
  const room = new MatchRoom();
  room.join();

  playSeconds(room, 100);

  expect(room.snapshotFor("first")).toBeUndefined();

  room.join();

  expect(room.snapshotFor("second")?.round).toBe("playing");
  expect(room.snapshotFor("second")?.match).toEqual({playerWins: 0, opponentWins: 0, roundNumber: 1});
});

it("gives a seat the whole idle time from the moment a round is decided to ask for the next one", () => {
  const room = startedRoom();
  winRound(room, "first");

  // The second seat was silent through the whole fight; its time to ask begins only now.
  playSeconds(room, 59.5);

  expect(room.snapshotFor("first")?.match).toEqual({playerWins: 1, opponentWins: 0, roundNumber: 1});
});

it("forfeits the next round for a seat that never asks for it, once the other has", () => {
  const room = startedRoom();
  winRound(room, "first");
  playSeconds(room, 1);
  room.ready("first");

  playSeconds(room, 58);

  expect(room.snapshotFor("first")?.match).toEqual({playerWins: 1, opponentWins: 0, roundNumber: 1});

  playSeconds(room, 3);

  expect(room.snapshotFor("first")?.match).toEqual({playerWins: 2, opponentWins: 0, roundNumber: 2});
  expect(room.snapshotFor("first")?.round).toBe("won");
  expect(room.snapshotFor("second")?.round).toBe("lost");
  expect(room.snapshotFor("first")?.ready).toEqual({player: false, opponent: false});
});

it("forfeits the next round for a seat whose person is away when a round is decided", () => {
  const room = startedRoom();
  winRound(room, "first");
  room.leave("second");

  playSeconds(room, 31);

  expect(room.snapshotFor("first")?.match).toEqual({playerWins: 2, opponentWins: 0, roundNumber: 2});
  expect(room.snapshotFor("first")?.round).toBe("won");
});

it("counts the ask to go on as a sign the person is there", () => {
  const room = startedRoom();
  winRound(room, "first");
  playSeconds(room, 40);
  room.ready("second");

  playSeconds(room, 21);

  // The first seat has said nothing for 61 s since the round was decided, the second only 21: the first is the one who forfeits.
  expect(room.snapshotFor("first")?.match).toEqual({playerWins: 1, opponentWins: 1, roundNumber: 2});
  expect(room.snapshotFor("second")?.round).toBe("won");
});

it("forfeits no round once the match is decided, whoever stays quiet", () => {
  const room = startedRoom();
  winRound(room, "first");
  room.ready("first");
  room.ready("second");
  winRound(room, "first");
  playSeconds(room, 1);
  room.ready("first");

  playSeconds(room, 200);

  expect(room.snapshotFor("first")?.match).toEqual({playerWins: 2, opponentWins: 0, roundNumber: 2});
  expect(room.snapshotFor("first")?.round).toBe("won");
});

function startedRoom(): MatchRoom {
  const room = new MatchRoom();
  room.join();
  room.join();

  return room;
}

/** Has `winner` shoot the other seat, who stands still, until the round is decided. */
function winRound(room: MatchRoom, winner: Seat): void {
  const loser: Seat = winner === "first" ? "second" : "first";
  const aimAt = room.snapshotFor(loser)?.player.position;
  const seq = (room.snapshotFor(winner)?.ack?.seq ?? 0) + 1;
  room.setInput(winner, {...IDLE, aimAt, firing: true}, seq);

  for (let step = 0; step < MOST_STEPS_TO_DECIDE_A_ROUND && room.snapshotFor(winner)?.round === "playing"; step += 1) {
    room.tick();
  }

  room.setInput(winner, IDLE, seq + 1);
}

/** Plays `seconds` of game time, a second at a time, with `seat` asking for something new in each, so that it is plainly there. */
function playSecondsAsking(room: MatchRoom, seat: Seat, seconds: number): void {
  for (let second = 0; second < seconds; second += 1) {
    askSomethingNew(room, seat, second);
    playSeconds(room, 1);
  }
}

/** Has `seat` ask for something new, as a browser does when its player changes what they hold down: it walks east, then west, then east again. */
function askSomethingNew(room: MatchRoom, seat: Seat, count: number): void {
  const seq = (room.snapshotFor(seat)?.ack?.seq ?? 0) + 1;
  room.setInput(seat, {...IDLE, direction: {x: count % 2 === 0 ? 1 : -1, y: 0}}, seq);
}

/** Plays `seconds` of game time, in one go. */
function playSeconds(room: MatchRoom, seconds: number): void {
  room.tick(Math.round(seconds * STEPS_PER_SECOND));
}

/** Has `seat` send what it last asked for again, as a browser's heartbeat does. */
function repeatTheAsk(room: MatchRoom, seat: Seat): void {
  const seq = (room.snapshotFor(seat)?.ack?.seq ?? 0) + 1;
  room.setInput(seat, IDLE, seq);
}
