import {SnapshotBuffer} from "@src/online/interpolation/SnapshotBuffer";
import type {SnapshotOfOpponent} from "@src/online/interpolation/types/SnapshotOfOpponent";

function at(elapsedSeconds: number): SnapshotOfOpponent {
  return {elapsedSeconds, opponent: undefined};
}

it("keeps the snapshots it is given, oldest first, and says which is newest", () => {
  const buffer = new SnapshotBuffer(5);
  buffer.add(at(1));
  buffer.add(at(2));

  expect(buffer.all.map(snapshot => snapshot.elapsedSeconds)).toEqual([1, 2]);
  expect(buffer.newest?.elapsedSeconds).toBe(2);
});

it("forgets the oldest past its limit", () => {
  const buffer = new SnapshotBuffer(2);
  buffer.add(at(1));
  buffer.add(at(2));
  buffer.add(at(3));

  expect(buffer.all.map(snapshot => snapshot.elapsedSeconds)).toEqual([2, 3]);
});

it("starts again when the server's game time goes back, as it does with each round, so the new round is not blended into the old", () => {
  const buffer = new SnapshotBuffer(5);
  buffer.add(at(10));
  buffer.add(at(11));
  buffer.add(at(0.02));

  expect(buffer.all.map(snapshot => snapshot.elapsedSeconds)).toEqual([0.02]);
});

it("has no newest snapshot before it is given one", () => {
  expect(new SnapshotBuffer(5).newest).toBeUndefined();
});
