import assert from "node:assert/strict";
import {it} from "node:test";
import {loopJumpOf} from "@gunsmith/audio-studies/encoding/pcm/loop/LoopJumpOf";

it("is the step from the last frame back to the first", () => {
  assert.equal(loopJumpOf([Float32Array.of(0.5, 0.1, -0.25)]), 0.75);
});

it("is the worst step over every channel, whichever its sign", () => {
  assert.equal(loopJumpOf([Float32Array.of(0.5, 0.5), Float32Array.of(-0.25, 0.5)]), 0.75);
  assert.equal(loopJumpOf([Float32Array.of(0.5, 0.25), Float32Array.of(0.25, 0.25)]), 0.25);
});

it("is zero for a loop that joins exactly", () => {
  assert.equal(loopJumpOf([Float32Array.of(0.25, 0.5, 0.25)]), 0);
});
