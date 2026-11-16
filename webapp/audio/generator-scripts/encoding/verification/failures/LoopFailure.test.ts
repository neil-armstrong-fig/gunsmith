import {expect, it} from "vitest";
import {loopFailure} from "@gunsmith/audio-studies/encoding/verification/failures/LoopFailure";

it("passes a music loop whose join is within the mastering limit, and one exactly at it", () => {
  expect(loopFailure({key: "music-loop-match", name: "m.ogg", loopJump: 0.002})).toBe(undefined);
  expect(loopFailure({key: "music-loop-match", name: "m.ogg", loopJump: 0.003})).toBe(undefined);
});

it("names a music loop whose join jumps further than the limit", () => {
  expect(loopFailure({key: "music-loop-menu", name: "m.mp3", loopJump: 0.0031})).toBe("m.mp3: loop discontinuity");
});

it("does not judge an effect's join, because an effect does not loop", () => {
  expect(loopFailure({key: "sfx-hit", name: "h.ogg", loopJump: 0.9})).toBe(undefined);
});
