import {expect, it} from "vitest";
import {bassRootOf} from "@gunsmith/audio-studies/generators/music/bar/bass/root/BassRoot";

it("walks D, D, Bb, C, D, F, Bb, C over eight bars", () => {
  expect(Array.from({length: 8}, (_, bar) => bassRootOf(bar))).toStrictEqual([38, 38, 34, 36, 38, 41, 34, 36]);
});

it("starts the walk again every eight bars", () => {
  expect(bassRootOf(8)).toBe(38);
  expect(bassRootOf(13)).toBe(bassRootOf(5));
  expect(bassRootOf(47)).toBe(bassRootOf(7));
});
