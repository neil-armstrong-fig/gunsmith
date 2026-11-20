import type {Input} from "@gunsmith/engine/game-loop/types/Input";
import type {World} from "@gunsmith/engine/game-loop/types/World";
import {startingWorld} from "@gunsmith/engine/game-loop/StartingWorld";
import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {PLAYER_SPEED} from "@gunsmith/engine/player/walking/PlayerSpeed";
import {viewOfSeat} from "@gunsmith/engine/seat/ViewOfSeat";
import {OnlineMatch} from "@src/online/OnlineMatch";
import {SeatTokenKeeper} from "@src/online/seat-token/SeatTokenKeeper";
import type {SeatTokenStorage} from "@src/online/seat-token/types/SeatTokenStorage";
import type {FrameEvent} from "@src/online/types/FrameEvent";
import type {InputAck} from "@gunsmith/shared/online/types/InputAck";
import type {MatchSocket} from "@src/online/types/MatchSocket";
import type {Readiness} from "@src/online/types/Readiness";

const ROWS = ["############", "#..........#", "#..........#", "#..........#", "#..........#", "############"];

const IDLE: Input = {direction: {x: 0, y: 0}, firing: false, reload: false};
const EAST: Input = {...IDLE, direction: {x: 1, y: 0}};
const STEP_SECONDS = 1 / 60;
const STEP_DISTANCE = PLAYER_SPEED * STEP_SECONDS;

class FakeSocket implements MatchSocket {
  readyState = 1;
  sent: string[] = [];
  closed = false;
  private listener: ((event: FrameEvent) => void) | undefined;

  send(text: string): void {
    this.sent.push(text);
  }

  close(): void {
    this.closed = true;
  }

  addEventListener(_type: "message", listener: (event: FrameEvent) => void): void {
    this.listener = listener;
  }

  receive(data: unknown): void {
    this.listener?.({data});
  }

  frames(): Record<string, unknown>[] {
    return this.sent.map(text => JSON.parse(text) as Record<string, unknown>);
  }
}

interface SnapshotRequest {
  world?: World;
  ack?: InputAck;
  elapsedSeconds?: number;
  ready?: Readiness;
}

const JOINED = JSON.stringify({kind: "joined", seat: "first", arena: ROWS});
const START = startingWorld(arenaFrom(ROWS), [], {x: 8.5, y: 2.5}).player.position;

interface SeatedMatch {
  socket: FakeSocket;
  match: OnlineMatch;
}

it("has no world until it has been seated and sent a snapshot", () => {
  const socket = new FakeSocket();
  const match = new OnlineMatch(socket);

  expect(match.worldToShow(0)).toBeUndefined();
  socket.receive(snapshotText());
  expect(match.worldToShow(0)).toBeUndefined();
});

it("builds the world a snapshot describes, on the arena it was seated in", () => {
  const {socket, match} = seatedMatch();
  socket.receive(snapshotText());
  const world = match.worldToShow(0);

  expect(world?.arena).toEqual(arenaFrom(ROWS));
  expect(world?.player.position).toEqual(START);
  expect(world?.opponent?.position).toEqual({x: 8.5, y: 2.5});
});

it("ignores frames it cannot read", () => {
  const {socket, match} = seatedMatch();
  socket.receive("nope");
  socket.receive(new ArrayBuffer(4));

  expect(match.worldToShow(0)).toBeUndefined();
});

it("sends an input when it first asks, numbered by its step, and not again while the ask is the same", () => {
  const {socket, match} = seatedMatch();
  steps(match, 3, EAST);

  expect(socket.frames()).toEqual([{kind: "input", seq: 0, direction: {x: 1, y: 0}, firing: false, reload: false}]);
});

it("sends an input again when what it asks for changes, numbered by the step it began on", () => {
  const {socket, match} = seatedMatch();
  steps(match, 2, EAST);
  steps(match, 1, {...EAST, firing: true});
  steps(match, 1, IDLE);

  expect(socket.frames().map(frame => frame["seq"])).toEqual([0, 2, 3]);
});

it("repeats what it asks for about ten times a second while nothing changes, so the server can line its count up again", () => {
  const {socket, match} = seatedMatch();
  steps(match, 13, EAST);

  expect(socket.frames().map(frame => frame["seq"])).toEqual([0, 6, 12]);
});

it("asks for a reload or a weapon switch once: the steps after and the heartbeat do not repeat it", () => {
  const {socket, match} = seatedMatch();
  match.step({...IDLE, reload: true, switchTo: 2});
  steps(match, 7, IDLE);

  expect(socket.frames()).toHaveLength(2);
  expect(socket.frames()[0]).toEqual(expect.objectContaining({reload: true, switchTo: 2, seq: 0}));
  expect(socket.frames()[1]).toEqual(expect.objectContaining({reload: false, seq: 6}));
  expect(socket.frames()[1]).not.toHaveProperty("switchTo");
});

it("sends nothing while the socket is not open", () => {
  const {socket, match} = seatedMatch();
  socket.sent = [];
  socket.readyState = 0;
  steps(match, 2, EAST);

  expect(socket.sent).toEqual([]);
});

it("shows the player walking at once, without waiting for the server to say so", () => {
  const {socket, match} = seatedMatch();
  socket.receive(snapshotText({ack: {seq: 0, held: 0}}));
  steps(match, 6, EAST);

  expect(match.worldToShow(0)?.player.position.x).toBeCloseTo(START.x + 6 * STEP_DISTANCE, 6);
});

it("walks the player from the first snapshot on, and plays all it asked for again while the server has not said it has any", () => {
  const {socket, match} = seatedMatch();
  socket.receive(snapshotText());
  steps(match, 6, EAST);
  socket.receive(snapshotText());

  expect(match.worldToShow(0)?.player.position.x).toBeCloseTo(START.x + 6 * STEP_DISTANCE, 6);
});

it("plays the inputs the server has not reached again on top of its word", () => {
  const {socket, match} = seatedMatch();
  socket.receive(snapshotText({ack: {seq: 0, held: 0}}));
  steps(match, 10, EAST);

  const server = startingWorld(arenaFrom(ROWS), [], {x: 8.5, y: 2.5});
  const behind = {...server, player: {...server.player, position: {x: START.x + 4 * STEP_DISTANCE, y: START.y}}};
  socket.receive(snapshotText({world: behind, ack: {seq: 0, held: 4}}));

  expect(match.worldToShow(0)?.player.position.x).toBeCloseTo(START.x + 10 * STEP_DISTANCE, 6);
});

it("starts the replay where the server's count says it has reached, however the steps since were counted", () => {
  const {socket, match} = seatedMatch();
  socket.receive(snapshotText({ack: {seq: 0, held: 0}}));
  steps(match, 10, EAST);

  const server = startingWorld(arenaFrom(ROWS), [], {x: 8.5, y: 2.5});
  const behind = {...server, player: {...server.player, position: {x: START.x + 8 * STEP_DISTANCE, y: START.y}}};
  socket.receive(snapshotText({world: behind, ack: {seq: 6, held: 2}}));

  expect(match.worldToShow(0)?.player.position.x).toBeCloseTo(START.x + 10 * STEP_DISTANCE, 6);
});

it("eases a small disagreement with the server out over the next steps instead of jumping", () => {
  const {socket, match} = seatedMatch();
  socket.receive(snapshotText({ack: {seq: 0, held: 0}}));
  steps(match, 10, EAST);
  const before = match.worldToShow(0)?.player.position.x ?? 0;

  const server = startingWorld(arenaFrom(ROWS), [], {x: 8.5, y: 2.5});
  const slower = {...server, player: {...server.player, position: {x: START.x + 3 * STEP_DISTANCE, y: START.y}}};
  socket.receive(snapshotText({world: slower, ack: {seq: 0, held: 4}}));
  const justAfter = match.worldToShow(0)?.player.position.x ?? 0;
  steps(match, 6, IDLE);
  const later = match.worldToShow(0)?.player.position.x ?? 0;

  const predicted = START.x + 3 * STEP_DISTANCE + 6 * STEP_DISTANCE;
  expect(justAfter).toBeCloseTo(before, 6);
  expect(later).toBeGreaterThan(predicted - 0.0001);
  expect(later).toBeLessThan(before);
});

it("puts the player where the server says, at once, when they disagree by a lot", () => {
  const {socket, match} = seatedMatch();
  socket.receive(snapshotText({ack: {seq: 0, held: 0}}));
  steps(match, 30, EAST);

  const server = startingWorld(arenaFrom(ROWS), [], {x: 8.5, y: 2.5});
  const blocked = {...server, player: {...server.player, position: {x: START.x + 0.2, y: START.y}}};
  socket.receive(snapshotText({world: blocked, ack: {seq: 0, held: 29}}));

  expect(match.worldToShow(0)?.player.position.x).toBeCloseTo(START.x + 0.2 + STEP_DISTANCE, 6);
});

it("takes the server's word as it is when it has forgotten the steps the server has not reached", () => {
  const {socket, match} = seatedMatch();
  socket.receive(snapshotText({ack: {seq: 0, held: 0}}));
  steps(match, 100, EAST);

  const server = startingWorld(arenaFrom(ROWS), [], {x: 8.5, y: 2.5});
  const there = {...server, player: {...server.player, position: {x: 3, y: 3}}};
  socket.receive(snapshotText({world: there, ack: {seq: 0, held: 5}}));

  expect(match.worldToShow(0)?.player.position).toEqual({x: 3, y: 3});
});

it("does not walk the player once the round is decided", () => {
  const {socket, match} = seatedMatch();
  const server = startingWorld(arenaFrom(ROWS), [], {x: 8.5, y: 2.5});
  socket.receive(snapshotText({world: {...server, round: "won"}, ack: {seq: 0, held: 0}}));
  steps(match, 6, EAST);

  expect(match.worldToShow(0)?.player.position).toEqual(START);
});

it("takes the server's word as it is once a snapshot says the round is decided, without playing the inputs again", () => {
  const {socket, match} = seatedMatch();
  socket.receive(snapshotText({ack: {seq: 0, held: 0}}));
  steps(match, 6, EAST);

  const server = startingWorld(arenaFrom(ROWS), [], {x: 8.5, y: 2.5});
  socket.receive(snapshotText({world: {...server, round: "won"}, ack: {seq: 0, held: 0}}));
  steps(match, 120, EAST);

  expect(match.worldToShow(0)?.player.position.x).toBeCloseTo(START.x, 2);
});

it("draws the other fighter a little behind the newest snapshot, blended between two", () => {
  const {socket, match} = seatedMatch();
  const at = (x: number, elapsedSeconds: number): string => {
    const world = startingWorld(arenaFrom(ROWS), [], {x, y: 2.5});

    return snapshotText({world, elapsedSeconds});
  };
  socket.receive(at(8, 1));
  steps(match, 3, IDLE);
  socket.receive(at(9, 1.1));
  steps(match, 3, IDLE);
  socket.receive(at(10, 1.2));

  // Nothing has passed since the newest arrived, so the fighter is drawn 0.1 s of game time behind it: where the snapshot of 1.1 s put them.
  expect(match.worldToShow(0)?.opponent?.position.x).toBeCloseTo(9, 6);
});

it("moves the other fighter on as the browser's own clock does, between snapshots", () => {
  const {socket, match} = seatedMatch();
  const at = (x: number, elapsedSeconds: number): string => {
    return snapshotText({world: startingWorld(arenaFrom(ROWS), [], {x, y: 2.5}), elapsedSeconds});
  };
  socket.receive(at(8, 1));
  socket.receive(at(9, 1.1));
  socket.receive(at(10, 1.2));
  match.worldToShow(0);
  steps(match, 3, IDLE);

  expect(match.worldToShow(0)?.opponent?.position.x).toBeCloseTo(9.5, 6);
  expect(match.worldToShow(STEP_SECONDS / 2)?.opponent?.position.x).toBeGreaterThan(9.5);
});

it("holds the other fighter where the newest snapshot has them while the next is late, then moves on from there rather than jumping", () => {
  const {socket, match} = seatedMatch();
  const at = (x: number, elapsedSeconds: number): string => {
    return snapshotText({world: startingWorld(arenaFrom(ROWS), [], {x, y: 2.5}), elapsedSeconds});
  };
  socket.receive(at(8, 1));
  socket.receive(at(9, 1.1));
  match.worldToShow(0);
  steps(match, 30, IDLE);
  const held = match.worldToShow(0)?.opponent?.position.x;
  socket.receive(at(10, 1.6));
  steps(match, 1, IDLE);
  const resumed = match.worldToShow(0)?.opponent?.position.x ?? 0;

  expect(held).toBe(9);
  expect(resumed).toBeGreaterThan(9);
  expect(resumed).toBeLessThan(9.3);
});

it("draws nobody for a fighter the server did not send", () => {
  const {socket, match} = seatedMatch();
  const server = startingWorld(arenaFrom(ROWS), [], {x: 8.5, y: 2.5});
  const hidden = {...server, player: {...server.player, aim: {x: -1, y: 0}}};
  socket.receive(snapshotText({world: hidden}));

  expect(match.worldToShow(0)?.opponent).toBeUndefined();
});

it("asks the server to go on to the next round with a ready message", () => {
  const {socket, match} = seatedMatch();

  match.readyForNextRound();

  expect(socket.frames()).toEqual([{kind: "ready"}]);
});

it("does not send a ready message while the socket is not open", () => {
  const {socket, match} = seatedMatch();
  socket.readyState = 0;

  match.readyForNextRound();

  expect(socket.frames()).toEqual([]);
});

it("is waiting for the other player once the server says this seat has asked to go on, and not before", () => {
  const {socket, match} = seatedMatch();
  expect(match.isWaitingForTheOtherPlayer()).toBe(false);

  socket.receive(snapshotText());
  expect(match.isWaitingForTheOtherPlayer()).toBe(false);

  socket.receive(snapshotText({ready: {player: true, opponent: false}}));
  expect(match.isWaitingForTheOtherPlayer()).toBe(true);

  socket.receive(snapshotText({ready: {player: false, opponent: false}}));
  expect(match.isWaitingForTheOtherPlayer()).toBe(false);
});

class MemoryStorage implements SeatTokenStorage {
  readonly items = new Map<string, string>();

  getItem(key: string): string | null {
    return this.items.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.items.set(key, value);
  }
}

it("keeps the token the server gives its seat, to get the seat back with after a reload", () => {
  const storage = new MemoryStorage();
  const socket = new FakeSocket();
  new OnlineMatch(socket, new SeatTokenKeeper(() => storage, "ABC234"));

  socket.receive(JSON.stringify({kind: "joined", seat: "first", arena: ROWS, token: "the-token"}));

  expect(new SeatTokenKeeper(() => storage, "ABC234").read()).toBe("the-token");
});

it("counts its inputs from nothing and sends the ask in force again when the server seats it again", () => {
  const {socket, match} = seatedMatch();
  steps(match, 5, EAST);
  socket.sent = [];

  socket.receive(JOINED);
  steps(match, 2, EAST);

  expect(socket.frames()).toEqual([{kind: "input", seq: 0, direction: {x: 1, y: 0}, firing: false, reload: false}]);
});

it("sends nothing on a connection made again until the server has seated it, so no input carries a number from the old count", () => {
  const {socket, match} = seatedMatch();
  steps(match, 8, EAST);
  socket.readyState = 0;
  steps(match, 2, EAST);
  socket.readyState = 1;
  socket.sent = [];

  steps(match, 10, EAST);
  expect(socket.sent).toEqual([]);

  socket.receive(JOINED);
  steps(match, 1, EAST);
  expect(socket.frames()).toEqual([{kind: "input", seq: 0, direction: {x: 1, y: 0}, firing: false, reload: false}]);
});

it("takes the server's word as it is on the snapshot that follows being seated again, with no inputs of the lost connection played over it", () => {
  const {socket, match} = seatedMatch();
  socket.receive(snapshotText());
  steps(match, 30, EAST);

  socket.receive(JOINED);
  socket.receive(snapshotText());

  expect(match.worldToShow(0)?.player.position.x).toBeCloseTo(START.x, 5);
});

it("is reconnecting when the connection is lost after the match began, and not before it began", () => {
  const socket = new FakeSocket();
  const match = new OnlineMatch(socket);
  socket.readyState = 0;
  expect(match.isReconnecting()).toBe(false);

  socket.readyState = 1;
  socket.receive(JOINED);
  expect(match.isReconnecting()).toBe(false);

  socket.readyState = 0;
  expect(match.isReconnecting()).toBe(true);

  socket.readyState = 1;
  expect(match.isReconnecting()).toBe(false);
});

it("is not reconnecting once the socket has closed for good", () => {
  const {socket, match} = seatedMatch();

  socket.readyState = 3;

  expect(match.isReconnecting()).toBe(false);
});

it("closes the socket", () => {
  const socket = new FakeSocket();
  new OnlineMatch(socket).close();

  expect(socket.closed).toBe(true);
});

const OTHER_ROWS = [
  "##############",
  "#............#",
  "#............#",
  "#............#",
  "#............#",
  "##############",
];

it("plays on the arena the server says was decided, in place of the one it was seated in", () => {
  const {socket, match} = seatedMatch();

  socket.receive(JSON.stringify({kind: "arena", rows: OTHER_ROWS}));
  socket.receive(snapshotText({world: startingWorld(arenaFrom(OTHER_ROWS), [], {x: 8.5, y: 2.5})}));

  expect(match.worldToShow(0)?.arena).toEqual(arenaFrom(OTHER_ROWS));
});

it("has nothing to show of the choosing until the server says something about it", () => {
  const {match} = seatedMatch();

  expect(match.preRound()).toBeUndefined();
});

it("shows what the server last said of the choosing, and stops once the match has begun", () => {
  const {socket, match} = seatedMatch();
  const frame = {kind: "preRound", stage: "choosing", own: {locked: false}, opponent: {locked: true, picked: false}};

  socket.receive(JSON.stringify(frame));
  expect(match.preRound()).toEqual(frame);

  socket.receive(snapshotText());
  expect(match.preRound()).toBeUndefined();
});

it("puts an arena forward by its name", () => {
  const {socket, match} = seatedMatch();

  match.chooseArena("Fair duel");

  expect(socket.frames()).toEqual([{kind: "choose", step: "arena", choice: {kind: "builtIn", name: "Fair duel"}}]);
});

it("locks in the arena it has chosen", () => {
  const {socket, match} = seatedMatch();

  match.lockInArena();

  expect(socket.frames()).toEqual([{kind: "lockIn", step: "arena"}]);
});

it("picks between the two arenas shown", () => {
  const {socket, match} = seatedMatch();

  match.pickArena({kind: "arena", seat: "second"});

  expect(socket.frames()).toEqual([{kind: "pickArena", pick: {kind: "arena", seat: "second"}}]);
});

it("sends no choosing while the socket is not open", () => {
  const {socket, match} = seatedMatch();
  socket.readyState = 0;

  match.chooseArena("Duel");
  match.lockInArena();
  match.pickArena({kind: "nothing"});

  expect(socket.frames()).toEqual([]);
});

function snapshotText(request: SnapshotRequest = {}): string {
  const world = request.world ?? startingWorld(arenaFrom(ROWS), [], {x: 8.5, y: 2.5});

  return JSON.stringify({
    kind: "snapshot",
    ...viewOfSeat(world, "first"),
    elapsedSeconds: request.elapsedSeconds ?? world.elapsedSeconds,
    ack: request.ack,
    ready: request.ready,
  });
}

function seatedMatch(): SeatedMatch {
  const socket = new FakeSocket();
  const match = new OnlineMatch(socket);
  socket.receive(JOINED);

  return {socket, match};
}

function steps(match: OnlineMatch, count: number, input: Input): void {
  for (let step = 0; step < count; step += 1) {
    match.step(input);
  }
}
