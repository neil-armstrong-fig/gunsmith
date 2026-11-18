import {afterEach, beforeEach, expect, it, vi} from "vitest";
import {ReconnectingSocket} from "@src/online/socket/reconnecting/ReconnectingSocket";
import type {CloseEvent} from "@src/online/socket/reconnecting/types/CloseEvent";
import type {RawSocket} from "@src/online/socket/reconnecting/types/RawSocket";
import type {FrameEvent} from "@src/online/types/FrameEvent";

const OPEN = 1;
const CONNECTING = 0;
const CLOSED = 3;

class FakeSocket implements RawSocket {
  readyState = OPEN;
  sent: string[] = [];
  closed = false;
  private onMessage: ((event: FrameEvent) => void) | undefined;
  private onClose: ((event: CloseEvent) => void) | undefined;

  send(text: string): void {
    this.sent.push(text);
  }

  close(): void {
    this.closed = true;
  }

  addEventListener(type: "message", listener: (event: FrameEvent) => void): void;
  addEventListener(type: "close", listener: (event: CloseEvent) => void): void;
  addEventListener(
    type: "message" | "close",
    listener: ((event: FrameEvent) => void) | ((event: CloseEvent) => void),
  ): void {
    if (type === "message") {
      this.onMessage = listener as (event: FrameEvent) => void;
    }
    if (type === "close") {
      this.onClose = listener as (event: CloseEvent) => void;
    }
  }

  receive(data: unknown): void {
    this.onMessage?.({data});
  }

  dropWith(code: number): void {
    this.readyState = CLOSED;
    this.onClose?.({code});
  }
}

let opened: FakeSocket[] = [];

beforeEach(() => {
  opened = [];
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

it("opens a connection at once and passes its frames on", () => {
  const frames: unknown[] = [];
  const socket = new ReconnectingSocket(openSocket);
  socket.addEventListener("message", event => {
    frames.push(event.data);
  });

  opened[0]?.receive("hello");

  expect(opened).toHaveLength(1);
  expect(frames).toEqual(["hello"]);
  expect(socket.readyState).toBe(OPEN);
});

it("sends on the connection it has", () => {
  const socket = new ReconnectingSocket(openSocket);

  socket.send("ask");

  expect(opened[0]?.sent).toEqual(["ask"]);
});

it("opens another connection after a drop, and passes its frames to the same listeners", () => {
  const frames: unknown[] = [];
  const socket = new ReconnectingSocket(openSocket);
  socket.addEventListener("message", event => {
    frames.push(event.data);
  });

  opened[0]?.dropWith(1006);

  expect(socket.readyState).toBe(CONNECTING);
  expect(opened).toHaveLength(1);

  vi.advanceTimersByTime(250);
  opened[1]?.receive("again");

  expect(opened).toHaveLength(2);
  expect(frames).toEqual(["again"]);
  expect(socket.readyState).toBe(OPEN);
});

it("sends nothing while it has no connection", () => {
  const socket = new ReconnectingSocket(openSocket);
  opened[0]?.dropWith(1006);

  socket.send("ask");

  expect(opened[0]?.sent).toEqual([]);
});

it("waits longer after each failed try, up to a limit, and starts again from the short wait once it hears from the server", () => {
  const socket = new ReconnectingSocket(openSocket);
  opened[0]?.dropWith(1006);
  vi.advanceTimersByTime(250);
  opened[1]?.dropWith(1006);

  vi.advanceTimersByTime(499);
  expect(opened).toHaveLength(2);
  vi.advanceTimersByTime(1);
  expect(opened).toHaveLength(3);

  opened[2]?.receive("joined");
  opened[2]?.dropWith(1006);
  vi.advanceTimersByTime(250);

  expect(opened).toHaveLength(4);
  expect(socket.readyState).toBe(OPEN);
});

it("does not wait for ever between tries", () => {
  new ReconnectingSocket(openSocket);
  for (let attempt = 0; attempt < 8; attempt += 1) {
    opened.at(-1)?.dropWith(1006);
    vi.advanceTimersByTime(4000);
  }

  expect(opened).toHaveLength(9);
});

it("never comes back after the server says the room is full", () => {
  const socket = new ReconnectingSocket(openSocket);

  opened[0]?.dropWith(4409);
  vi.advanceTimersByTime(60_000);

  expect(opened).toHaveLength(1);
  expect(socket.readyState).toBe(CLOSED);
});

it("never comes back after the server says the seat was taken over by another page", () => {
  const socket = new ReconnectingSocket(openSocket);

  opened[0]?.dropWith(4410);
  vi.advanceTimersByTime(60_000);

  expect(opened).toHaveLength(1);
  expect(socket.readyState).toBe(CLOSED);
});

it("does not come back after it was closed on purpose, and cancels a try already waiting", () => {
  const socket = new ReconnectingSocket(openSocket);
  opened[0]?.dropWith(1006);

  socket.close();
  vi.advanceTimersByTime(60_000);

  expect(opened).toHaveLength(1);
  expect(socket.readyState).toBe(CLOSED);
});

it("closes the connection it has when it is closed on purpose", () => {
  const socket = new ReconnectingSocket(openSocket);

  socket.close();

  expect(opened[0]?.closed).toBe(true);
});

function openSocket(): FakeSocket {
  const socket = new FakeSocket();
  opened.push(socket);

  return socket;
}
