import assert from "node:assert/strict";
import {it} from "node:test";
import {loopFailure} from "@gunsmith/audio-studies/encoding/verification/failures/LoopFailure";

it("passes a music loop whose join is within the mastering limit, and one exactly at it", () => {
  assert.equal(loopFailure({key: "music-loop-match", name: "m.ogg", loopJump: 0.002}), undefined);
  assert.equal(loopFailure({key: "music-loop-match", name: "m.ogg", loopJump: 0.003}), undefined);
});

it("names a music loop whose join jumps further than the limit", () => {
  assert.equal(loopFailure({key: "music-loop-menu", name: "m.mp3", loopJump: 0.0031}), "m.mp3: loop discontinuity");
});

it("does not judge an effect's join, because an effect does not loop", () => {
  assert.equal(loopFailure({key: "sfx-hit", name: "h.ogg", loopJump: 0.9}), undefined);
});
