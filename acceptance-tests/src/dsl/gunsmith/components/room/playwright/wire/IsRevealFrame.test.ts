import {expect, it} from "vitest";
import {isRevealFrame} from "@src/dsl/gunsmith/components/room/playwright/wire/IsRevealFrame";

it("knows the reveal as the server writes it", () => {
  expect(isRevealFrame(JSON.stringify({kind: "reveal", weapons: {}}))).toBe(true);
});

it("does not take a snapshot, or anything else, for one", () => {
  expect(isRevealFrame(JSON.stringify({kind: "snapshot", player: {}}))).toBe(false);
  expect(isRevealFrame("nope")).toBe(false);
});
