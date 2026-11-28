import {expect, it} from "vitest";
import {preRoundsOfFrames} from "@src/dsl/gunsmith/components/room/components/frames/playwright/choosing/PreRoundsOfFrames";

const NOTHING = {opponentFirstWeaponShown: false, opponentSecondWeaponShown: false, opponentArenaShown: false};

it("keeps only the preRound frames, in order", () => {
  const preRounds = preRoundsOfFrames([
    JSON.stringify({kind: "joined", seat: "first", arena: []}),
    JSON.stringify({kind: "preRound", opponent: {weapons: {slots: [{locked: false}, {locked: false}]}}}),
    JSON.stringify({kind: "snapshot"}),
    JSON.stringify({
      kind: "preRound",
      opponent: {weapons: {slots: [{locked: true, choice: {kind: "builtIn", key: "rifle"}}, {locked: false}]}},
    }),
  ]);

  expect(preRounds).toEqual([NOTHING, {...NOTHING, opponentFirstWeaponShown: true}]);
});

it("reads the second weapon and the arena apart from the first", () => {
  const preRounds = preRoundsOfFrames([
    JSON.stringify({
      kind: "preRound",
      opponent: {
        arena: {kind: "builtIn", name: "Duel"},
        weapons: {slots: [{locked: true}, {locked: true, choice: {kind: "builtIn", key: "rifle"}}]},
      },
    }),
  ]);

  expect(preRounds).toEqual([
    {opponentFirstWeaponShown: false, opponentSecondWeaponShown: true, opponentArenaShown: true},
  ]);
});

it("skips a frame that is not JSON, and one that is not an object", () => {
  expect(preRoundsOfFrames(["not json", "7", "null"])).toEqual([]);
});

it("reads nothing shown from a frame whose opponent says nothing of weapons", () => {
  expect(
    preRoundsOfFrames([
      JSON.stringify({kind: "preRound", opponent: {}}),
      JSON.stringify({kind: "preRound"}),
      JSON.stringify({kind: "preRound", opponent: {weapons: {slots: "none"}}}),
    ]),
  ).toEqual([NOTHING, NOTHING, NOTHING]);
});
