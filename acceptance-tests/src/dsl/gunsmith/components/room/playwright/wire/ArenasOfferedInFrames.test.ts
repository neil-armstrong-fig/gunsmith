import {expect, it} from "vitest";
import {arenasOfferedInFrames} from "@src/dsl/gunsmith/components/room/playwright/wire/ArenasOfferedInFrames";

it("reads the arenas the latest pre-round frame offers", () => {
  const frames = [
    JSON.stringify({kind: "preRound", builtInArenas: ["Duel", "Keep"]}),
    JSON.stringify({kind: "snapshot", player: {}}),
    JSON.stringify({kind: "preRound", builtInArenas: ["Slalom", "Keep"]}),
  ];

  expect(arenasOfferedInFrames(frames)).toEqual(["Slalom", "Keep"]);
});

it("reads nothing when no pre-round frame offers arenas", () => {
  expect(arenasOfferedInFrames([])).toBeUndefined();
  expect(arenasOfferedInFrames([JSON.stringify({kind: "preRound", stage: "choosing"})])).toBeUndefined();
  expect(arenasOfferedInFrames([JSON.stringify({kind: "snapshot", builtInArenas: ["Duel"]})])).toBeUndefined();
  expect(arenasOfferedInFrames(["not json", "null"])).toBeUndefined();
});

it("skips a list that is not all names", () => {
  expect(arenasOfferedInFrames([JSON.stringify({kind: "preRound", builtInArenas: ["Duel", 3]})])).toBeUndefined();
});
