import type {Input} from "@gunsmith/engine/game-loop/types/Input";
import {MatchRoom} from "@src/match/room/MatchRoom";

const IDLE: Input = {direction: {x: 0, y: 0}, firing: false, reload: false};

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

  room.setInput("first", {...IDLE, aimAt: toFace});
  room.tick();
  expect(room.snapshotFor("first")?.opponent).toBeDefined();

  room.setInput("first", {...IDLE, aimAt: {x: 1.5, y: 6.5}});
  room.tick();
  expect(room.snapshotFor("first")?.opponent).toBeUndefined();
});

it("plays each seat by its own input", () => {
  const room = startedRoom();
  const before = room.snapshotFor("second")?.player.position;

  room.setInput("second", {...IDLE, direction: {x: 0, y: 1}});
  room.tick();

  expect(room.snapshotFor("second")?.player.position.y).toBeGreaterThan(before?.y ?? Infinity);
  expect(room.snapshotFor("first")?.player.position.y).toBe(6.5);
});

it("plays the steps it is told, so a late clock can catch up", () => {
  const walkingNorth: Input = {...IDLE, direction: {x: 0, y: 1}};
  const slow = startedRoom();
  const caughtUp = startedRoom();

  slow.setInput("second", walkingNorth);
  slow.tick(1);
  caughtUp.setInput("second", walkingNorth);
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

  room.setInput("first", {...IDLE, reload: true, switchTo: 2});
  room.tick();
  const afterTheFirst = room.snapshotFor("first")?.player.equippedIndex;
  room.setInput("first", {...IDLE});
  room.tick();

  expect(afterTheFirst).toBe(1);
  expect(room.snapshotFor("first")?.player.equippedIndex).toBe(1);
});

it("keeps a weapon switch a later input in the same snapshot did not repeat", () => {
  const room = startedRoom();

  room.setInput("first", {...IDLE, switchTo: 2});
  room.setInput("first", {...IDLE});
  room.tick();

  expect(room.snapshotFor("first")?.player.equippedIndex).toBe(1);
});

it("does not step a match that has not begun", () => {
  const room = new MatchRoom();
  room.join();
  room.tick();

  expect(room.snapshotFor("first")).toBeUndefined();
});

it("tells a seat the arena it plays in", () => {
  expect(new MatchRoom().joinedMessage("second")).toEqual(expect.objectContaining({kind: "joined", seat: "second"}));
});

function startedRoom(): MatchRoom {
  const room = new MatchRoom();
  room.join();
  room.join();

  return room;
}
