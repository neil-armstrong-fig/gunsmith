import {expect, it} from "vitest";
import {isJoinedFrame} from "@src/dsl/gunsmith/components/room/components/connection/playwright/joined-frame/IsJoinedFrame";

it("knows the frame that seats a browser as the server writes it", () => {
  expect(isJoinedFrame(JSON.stringify({kind: "joined", seat: "first", arena: []}))).toBe(true);
});

it("does not take a snapshot, or anything else, for one", () => {
  expect(isJoinedFrame(JSON.stringify({kind: "snapshot", player: {}}))).toBe(false);
  expect(isJoinedFrame("nope")).toBe(false);
});
