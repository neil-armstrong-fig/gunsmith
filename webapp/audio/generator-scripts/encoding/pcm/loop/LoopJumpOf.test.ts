import {expect, it} from "vitest";
import {loopJumpOf} from "@gunsmith/audio-studies/encoding/pcm/loop/LoopJumpOf";

it("is the step from the last frame back to the first", () => {
  expect(loopJumpOf([Float32Array.of(0.5, 0.1, -0.25)])).toBe(0.75);
});

it("is the worst step over every channel, whichever its sign", () => {
  expect(loopJumpOf([Float32Array.of(0.5, 0.5), Float32Array.of(-0.25, 0.5)])).toBe(0.75);
  expect(loopJumpOf([Float32Array.of(0.5, 0.25), Float32Array.of(0.25, 0.25)])).toBe(0.25);
});

it("is zero for a loop that joins exactly", () => {
  expect(loopJumpOf([Float32Array.of(0.25, 0.5, 0.25)])).toBe(0);
});
