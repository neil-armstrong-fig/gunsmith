import assert from "node:assert/strict";
import {it} from "node:test";
import {MASTERING} from "@gunsmith/audio-studies/output/mastering/Mastering";

it("holds cues to a peak of about -3 dBFS, the mix to 0.65, and a loop join to 0.003 of full scale", () => {
  assert.deepEqual(MASTERING, {maxPeak: 0.708, mixPeak: 0.65, maxLoopJump: 0.003});
});
