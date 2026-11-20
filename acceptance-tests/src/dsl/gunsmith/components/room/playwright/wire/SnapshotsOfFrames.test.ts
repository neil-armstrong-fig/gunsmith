import {expect, it} from "vitest";
import {snapshotsOfFrames} from "@src/dsl/gunsmith/components/room/playwright/wire/SnapshotsOfFrames";

it("keeps only the snapshot frames, in order", () => {
  const snapshots = snapshotsOfFrames([
    JSON.stringify({kind: "round-start"}),
    JSON.stringify({kind: "snapshot", opponent: {x: 1, y: 2}}),
    JSON.stringify({kind: "snapshot"}),
  ]);

  expect(snapshots).toEqual([{opponent: {x: 1, y: 2}}, {}]);
});

it("skips a frame that is not JSON, and one that is not an object", () => {
  expect(snapshotsOfFrames(["not json", "7", "null"])).toEqual([]);
});

it("reads where the server put the seat's own fighter and its game time", () => {
  const snapshots = snapshotsOfFrames([
    JSON.stringify({kind: "snapshot", player: {position: {x: 3, y: 4}}, elapsedSeconds: 1.5}),
    JSON.stringify({kind: "snapshot", player: {position: {x: "3", y: 4}}}),
  ]);

  expect(snapshots).toEqual([{position: {x: 3, y: 4}, elapsedSeconds: 1.5}, {}]);
});

it("reads the events a snapshot carries, and none from a frame whose events are not a list", () => {
  const snapshots = snapshotsOfFrames([
    JSON.stringify({kind: "snapshot", events: [{kind: "heard", sound: "shot", sector: 2}]}),
    JSON.stringify({kind: "snapshot", events: "heard"}),
  ]);

  expect(snapshots).toEqual([{events: [{kind: "heard", sound: "shot", sector: 2}]}, {}]);
});

it("treats a null opponent as absent", () => {
  expect(snapshotsOfFrames([JSON.stringify({kind: "snapshot", opponent: null})])).toEqual([{}]);
});
