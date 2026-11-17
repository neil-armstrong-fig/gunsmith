import type {Input} from "@gunsmith/engine/game-loop/types/Input";
import {startingWorld} from "@gunsmith/engine/game-loop/StartingWorld";
import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {viewOfSeat} from "@gunsmith/engine/seat/ViewOfSeat";
import {OnlineMatch} from "@src/online/OnlineMatch";
import type {FrameEvent} from "@src/online/types/FrameEvent";
import type {MatchSocket} from "@src/online/types/MatchSocket";

const ROWS = ["########", "#......#", "#......#", "#......#", "########"];

const IDLE: Input = {direction: {x: 0, y: 0}, firing: false, reload: false};

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
}

function snapshotText(): string {
  const world = startingWorld(arenaFrom(ROWS), [], {x: 5.5, y: 2.5});

  return JSON.stringify({kind: "snapshot", ...viewOfSeat(world, "first")});
}

const JOINED = JSON.stringify({kind: "joined", seat: "first", arena: ROWS});

it("has no world until it has been seated and sent a snapshot", () => {
  const socket = new FakeSocket();
  const match = new OnlineMatch(socket);

  expect(match.takeWorld()).toBeUndefined();
  socket.receive(snapshotText());
  expect(match.takeWorld()).toBeUndefined();
});

it("builds the world a snapshot describes, on the arena it was seated in", () => {
  const socket = new FakeSocket();
  const match = new OnlineMatch(socket);
  socket.receive(JOINED);
  socket.receive(snapshotText());
  const world = match.takeWorld();

  expect(world?.arena).toEqual(arenaFrom(ROWS));
  expect(world?.player.position).toEqual({x: 4.5, y: 2.5});
  expect(world?.opponent?.position).toEqual({x: 5.5, y: 2.5});
});

it("hands over each world once", () => {
  const socket = new FakeSocket();
  const match = new OnlineMatch(socket);
  socket.receive(JOINED);
  socket.receive(snapshotText());

  expect(match.takeWorld()).toBeDefined();
  expect(match.takeWorld()).toBeUndefined();
});

it("ignores frames it cannot read", () => {
  const socket = new FakeSocket();
  const match = new OnlineMatch(socket);
  socket.receive(JOINED);
  socket.receive("nope");
  socket.receive(new ArrayBuffer(4));

  expect(match.takeWorld()).toBeUndefined();
});

it("sends an input as a frame", () => {
  const socket = new FakeSocket();
  const match = new OnlineMatch(socket);
  match.sendInput({...IDLE, direction: {x: 1, y: 0}, firing: true});

  expect(JSON.parse(socket.sent[0] ?? "")).toEqual({
    kind: "input",
    direction: {x: 1, y: 0},
    firing: true,
    reload: false,
  });
});

it("sends nothing while the socket is not open", () => {
  const socket = new FakeSocket();
  socket.readyState = 0;
  new OnlineMatch(socket).sendInput(IDLE);

  expect(socket.sent).toEqual([]);
});

it("closes the socket", () => {
  const socket = new FakeSocket();
  new OnlineMatch(socket).close();

  expect(socket.closed).toBe(true);
});
