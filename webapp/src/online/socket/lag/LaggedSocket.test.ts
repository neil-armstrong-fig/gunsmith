import {LaggedSocket} from "@src/online/socket/lag/LaggedSocket";
import type {FrameEvent} from "@src/online/types/FrameEvent";
import type {MatchSocket} from "@src/online/types/MatchSocket";

class FakeSocket implements MatchSocket {
  readyState = 1;
  sent: string[] = [];
  closed = false;
  listener: ((event: FrameEvent) => void) | undefined;

  send(text: string): void {
    this.sent.push(text);
  }

  close(): void {
    this.closed = true;
  }

  addEventListener(_type: "message", listener: (event: FrameEvent) => void): void {
    this.listener = listener;
  }
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

it("holds a frame the page sends up by the lag, then sends it", () => {
  const socket = new FakeSocket();
  new LaggedSocket(socket, 120).send("a");

  vi.advanceTimersByTime(119);
  expect(socket.sent).toEqual([]);
  vi.advanceTimersByTime(1);
  expect(socket.sent).toEqual(["a"]);
});

it("holds a frame the server sends up by the lag, then hands it to the page", () => {
  const socket = new FakeSocket();
  const heard: unknown[] = [];
  new LaggedSocket(socket, 80).addEventListener("message", event => {
    heard.push(event.data);
  });

  socket.listener?.({data: "x"});
  vi.advanceTimersByTime(79);
  expect(heard).toEqual([]);
  vi.advanceTimersByTime(1);
  expect(heard).toEqual(["x"]);
});

it("keeps frames in the order they came", () => {
  const socket = new FakeSocket();
  const lagged = new LaggedSocket(socket, 50);
  lagged.send("a");
  vi.advanceTimersByTime(10);
  lagged.send("b");
  vi.advanceTimersByTime(100);

  expect(socket.sent).toEqual(["a", "b"]);
});

it("is open when the socket under it is, and closes it", () => {
  const socket = new FakeSocket();
  const lagged = new LaggedSocket(socket, 50);
  socket.readyState = 0;

  expect(lagged.readyState).toBe(0);
  lagged.close();
  expect(socket.closed).toBe(true);
});
