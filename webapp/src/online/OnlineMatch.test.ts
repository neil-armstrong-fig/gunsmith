import type {Bullet} from "@gunsmith/engine/bullet/types/Bullet";
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
const QUIET = startingWorld(arenaFrom(ROWS), [], {x: 8.5, y: 2.5});
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

it("hands over the events the snapshots carried once, with the game time they cover, and nothing after", () => {
  const {socket, match} = seatedMatch();
  const heard = {kind: "heard", sound: "pickup", sector: 6, loudness: "mid"} as const;
  socket.receive(snapshotText({world: {...QUIET, events: [heard]}, elapsedSeconds: 1}));
  socket.receive(snapshotText({world: {...QUIET, events: [{kind: "pickupTaken"}]}, elapsedSeconds: 1.05}));
  socket.receive(snapshotText({elapsedSeconds: 1.1}));

  expect(match.takeEvents()).toEqual({
    events: [heard, {kind: "pickupTaken"}],
    seconds: expect.closeTo(0.1, 9),
    opponentVisible: true,
  });
  expect(match.takeEvents()).toBeUndefined();
});

it("hands over a quiet snapshot as no events and its time, so a frame with no news is not taken for one", () => {
  const {socket, match} = seatedMatch();
  socket.receive(snapshotText({elapsedSeconds: 1}));
  match.takeEvents();

  socket.receive(snapshotText({elapsedSeconds: 1.05}));

  expect(match.takeEvents()).toEqual({events: [], seconds: expect.closeTo(0.05, 9), opponentVisible: true});
});

it("covers no time for the first snapshot, and none when a new round turned the clock back", () => {
  const {socket, match} = seatedMatch();
  socket.receive(snapshotText({elapsedSeconds: 7}));
  expect(match.takeEvents()?.seconds).toBe(0);

  socket.receive(snapshotText({elapsedSeconds: 0.5}));
  expect(match.takeEvents()?.seconds).toBe(0);
});

it("reports the latest snapshot's visibility even if the rendered opponent is still held by interpolation", () => {
  const {socket, match} = seatedMatch();
  socket.receive(snapshotText({world: {...QUIET, events: [{kind: "hitLanded", on: "opponent"}]}, elapsedSeconds: 1}));
  socket.receive(snapshotText({world: {...QUIET, opponent: undefined}, elapsedSeconds: 1.05}));

  expect(match.worldToShow(0)?.opponent).toBeDefined();
  expect(match.takeEvents()).toMatchObject({events: [{kind: "hitLanded", on: "opponent"}], opponentVisible: false});
});

it("discards a previous round's queued events when a new round arrives before the next frame", () => {
  const {socket, match} = seatedMatch();
  socket.receive(snapshotText({world: {...QUIET, events: [{kind: "hitLanded", on: "opponent"}]}, elapsedSeconds: 7}));
  socket.receive(snapshotText({elapsedSeconds: 0}));

  expect(match.takeEvents()).toEqual({events: [], seconds: 0, opponentVisible: true});
});

it("discards the lost connection's queued ring damage when the server seats the browser again", () => {
  const {socket, match} = seatedMatch();
  socket.receive(
    snapshotText({world: {...QUIET, events: [{kind: "damageTaken", cause: "ring", amount: 1}]}, elapsedSeconds: 7}),
  );
  socket.readyState = 0;
  match.step(IDLE);
  socket.readyState = 1;
  socket.receive(JOINED);
  socket.receive(snapshotText({elapsedSeconds: 7.1}));

  expect(match.takeEvents()?.events).toEqual([]);
});

it("has no events to hand over before a snapshot has come, and shows none in the world each frame", () => {
  const {socket, match} = seatedMatch();
  expect(match.takeEvents()).toBeUndefined();

  socket.receive(snapshotText({world: {...QUIET, events: [{kind: "pickupTaken"}]}}));

  expect(match.worldToShow(0)?.events).toBeUndefined();
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

it("shows a bullet where the newest snapshot has it the moment it arrives", () => {
  const {socket, match} = seatedMatch();
  socket.receive(snapshotText({world: {...QUIET, bullets: [shotAt(3)]}}));

  expect(match.worldToShow(0)?.bullets[0]?.position.x).toBeCloseTo(3, 6);
});

it("flies a bullet on every frame between snapshots, as the browser's own clock moves, not once a snapshot", () => {
  const {socket, match} = seatedMatch();
  socket.receive(snapshotText({world: {...QUIET, bullets: [shotAt(3)]}}));
  steps(match, 3, IDLE);

  // Three steps of 1/60 s at 10 tiles a second.
  expect(match.worldToShow(0)?.bullets[0]?.position.x).toBeCloseTo(3.5, 6);
  expect(match.worldToShow(STEP_SECONDS / 2)?.bullets[0]?.position.x).toBeCloseTo(3.5 + 10 * (STEP_SECONDS / 2), 6);
});

it("puts a bullet on the newest snapshot's word when the next one comes, not on top of where it flew", () => {
  const {socket, match} = seatedMatch();
  socket.receive(snapshotText({world: {...QUIET, bullets: [shotAt(3)]}}));
  steps(match, 3, IDLE);
  socket.receive(snapshotText({world: {...QUIET, bullets: [shotAt(3.6)]}, elapsedSeconds: 0.05}));

  expect(match.worldToShow(0)?.bullets[0]?.position.x).toBeCloseTo(3.6, 6);
});

it("ends a bullet's flight at the wall it reaches between snapshots", () => {
  const {socket, match} = seatedMatch();
  socket.receive(snapshotText({world: {...QUIET, bullets: [shotAt(10.7)]}}));
  steps(match, 3, IDLE);

  expect(match.worldToShow(0)?.bullets).toEqual([]);
});

it("does not fly a bullet on for long when the next snapshot is late", () => {
  const {socket, match} = seatedMatch();
  socket.receive(snapshotText({world: {...QUIET, bullets: [shotAt(3)]}}));
  steps(match, 60, IDLE);

  // A second has passed, but a bullet is only taken a tenth of a second past what the server last said.
  expect(match.worldToShow(0)?.bullets[0]?.position.x).toBeCloseTo(4, 6);
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

it("knows its seat once the server has seated it, and not before", () => {
  const socket = new FakeSocket();
  const match = new OnlineMatch(socket);

  expect(match.seat()).toBeUndefined();

  socket.receive(JOINED);

  expect(match.seat()).toBe("first");
});

it("has nothing to show of the choosing until the server says something about it", () => {
  const {match} = seatedMatch();

  expect(match.preRound()).toBeUndefined();
});

it("shows what the server last said of the choosing, and stops once the match has begun", () => {
  const {socket, match} = seatedMatch();
  const frame = {
    kind: "preRound",
    stage: "choosing",
    builtInArenas: ["Duel", "Keep", "Slalom", "Pinwheel", "Catwalk"],
    own: {locked: false, weapons: {slots: [{locked: false}, {locked: false}]}},
    opponent: {locked: true, picked: false, weapons: {slots: [{locked: true}, {locked: false}]}},
  };

  socket.receive(JSON.stringify(frame));
  expect(match.preRound()).toEqual(frame);

  socket.receive(snapshotText());
  expect(match.preRound()).toBeUndefined();
});

it("puts an arena forward by its name", () => {
  const {socket, match} = seatedMatch();

  match.chooseArena({kind: "builtIn", name: "Fair duel"});

  expect(socket.frames()).toEqual([{kind: "choose", step: "arena", choice: {kind: "builtIn", name: "Fair duel"}}]);
});

it("locks in the arena it has chosen", () => {
  const {socket, match} = seatedMatch();

  match.lockInArena();

  expect(socket.frames()).toEqual([{kind: "lockIn", step: "arena"}]);
});

it("puts a built-in weapon forward for a slot, by its key", () => {
  const {socket, match} = seatedMatch();

  match.chooseWeapon(2, {kind: "builtIn", key: "submachine-gun"});

  expect(socket.frames()).toEqual([
    {kind: "choose", step: "weapon", slot: 2, choice: {kind: "builtIn", key: "submachine-gun"}},
  ]);
});

it("puts a saved arena forward by its id, never its body", () => {
  const {socket, match} = seatedMatch();

  match.chooseArena({kind: "saved", id: "arena-1"});

  expect(socket.frames()).toEqual([{kind: "choose", step: "arena", choice: {kind: "saved", id: "arena-1"}}]);
});

it("puts a saved weapon forward by its id, never its body", () => {
  const {socket, match} = seatedMatch();

  match.chooseWeapon(1, {kind: "saved", id: "weapon-1"});

  expect(socket.frames()).toEqual([{kind: "choose", step: "weapon", slot: 1, choice: {kind: "saved", id: "weapon-1"}}]);
});

it("keeps the reveal the server sends as the match begins", () => {
  const {socket, match} = seatedMatch();
  const frame = {
    kind: "reveal",
    arena: {name: "Duel", rows: ["###"]},
    weapons: {
      own: [
        {kind: "builtIn", key: "rifle"},
        {kind: "builtIn", key: "marksman-rifle"},
      ],
      opponent: [
        {kind: "saved", weapon: {bulletDamage: 20}, appearance: {version: 1}},
        {kind: "builtIn", key: "rifle"},
      ],
    },
  };

  expect(match.reveal()).toBeUndefined();

  socket.receive(JSON.stringify(frame));

  expect(match.reveal()).toEqual(frame);
});

it("keeps the other player's saved weapons the server tells once, by slot, through a reconnect", () => {
  const {socket, match} = seatedMatch();
  const first = {kind: "opponentWeapon", slot: 1, weapon: {bulletDamage: 20}, appearance: {version: 1}};
  const second = {kind: "opponentWeapon", slot: 2, weapon: {bulletDamage: 30}, appearance: {version: 1}};

  expect(match.opponentWeapons()).toEqual([undefined, undefined]);

  socket.receive(JSON.stringify(first));
  socket.receive(JSON.stringify({kind: "joined", seat: "first", arena: ["###"], token: "t"}));
  socket.receive(JSON.stringify(second));

  expect(match.opponentWeapons()).toEqual([first, second]);
});

it("locks in the weapon it has chosen for a slot", () => {
  const {socket, match} = seatedMatch();

  match.lockInWeapon(1);
  match.lockInWeapon(2);

  expect(socket.frames()).toEqual([
    {kind: "lockIn", step: "weapon", slot: 1},
    {kind: "lockIn", step: "weapon", slot: 2},
  ]);
});

it("picks between the two arenas shown", () => {
  const {socket, match} = seatedMatch();

  match.pickArena({kind: "arena", seat: "second"});

  expect(socket.frames()).toEqual([{kind: "pickArena", pick: {kind: "arena", seat: "second"}}]);
});

it("sends no choosing while the socket is not open", () => {
  const {socket, match} = seatedMatch();
  socket.readyState = 0;

  match.chooseArena({kind: "builtIn", name: "Duel"});
  match.lockInArena();
  match.chooseWeapon(1, {kind: "builtIn", key: "rifle"});
  match.lockInWeapon(1);
  match.pickArena({kind: "nothing"});

  expect(socket.frames()).toEqual([]);
});

/** The player's bullet flying east along the middle of the arena at 10 tiles a second, from `x`. */
function shotAt(x: number): Bullet {
  return {
    position: {x, y: 2.5},
    direction: {x: 1, y: 0},
    damage: 10,
    speed: 10,
    shooter: "player",
    level: 0,
    crouching: false,
    floor: 0,
  };
}

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
