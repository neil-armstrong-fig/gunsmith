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

it("treats a null opponent as absent", () => {
  expect(snapshotsOfFrames([JSON.stringify({kind: "snapshot", opponent: null})])).toEqual([{}]);
});
