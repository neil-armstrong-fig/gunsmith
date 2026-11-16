import {expect, it} from "vitest";
import {peakOf} from "@gunsmith/audio-studies/common/levels/peak/PeakOf";

it("finds the loudest sample, whichever its sign", () => {
  expect(peakOf([Float32Array.of(0.1, -0.5, 0.25)])).toBe(0.5);
  expect(peakOf([Float32Array.of(0.1, 0.5, -0.25)])).toBe(0.5);
});

it("looks across every channel", () => {
  expect(peakOf([Float32Array.of(0.1, 0.2), Float32Array.of(-0.75, 0.3)])).toBe(0.75);
});

it("is zero for silence and for no channels", () => {
  expect(peakOf([new Float32Array(4)])).toBe(0);
  expect(peakOf([])).toBe(0);
});
