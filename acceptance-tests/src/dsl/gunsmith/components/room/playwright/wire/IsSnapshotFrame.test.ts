import {expect, it} from "vitest";
import {isSnapshotFrame} from "@src/dsl/gunsmith/components/room/playwright/wire/IsSnapshotFrame";

it("knows a snapshot frame as the server writes it", () => {
  expect(isSnapshotFrame(JSON.stringify({kind: "snapshot", player: {}}))).toBe(true);
});

it("does not take the frame that seats a browser, or anything else, for one", () => {
  expect(isSnapshotFrame(JSON.stringify({kind: "joined", seat: "first", arena: []}))).toBe(false);
  expect(isSnapshotFrame("nope")).toBe(false);
});
