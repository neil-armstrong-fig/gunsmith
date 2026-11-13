import assert from "node:assert/strict";
import {it} from "node:test";
import {bassRootOf} from "@gunsmith/audio-studies/generators/music/bar/bass/root/BassRoot";

it("walks D, D, Bb, C, D, F, Bb, C over eight bars", () => {
  assert.deepEqual(
    Array.from({length: 8}, (_, bar) => bassRootOf(bar)),
    [38, 38, 34, 36, 38, 41, 34, 36],
  );
});

it("starts the walk again every eight bars", () => {
  assert.equal(bassRootOf(8), 38);
  assert.equal(bassRootOf(13), bassRootOf(5));
  assert.equal(bassRootOf(47), bassRootOf(7));
});
