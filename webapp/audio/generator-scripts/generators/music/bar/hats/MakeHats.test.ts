import assert from "node:assert/strict";
import {it} from "node:test";
import {makeHats} from "@gunsmith/audio-studies/generators/music/bar/hats/MakeHats";
import type {BarPosition} from "@gunsmith/audio-studies/generators/music/bar/types/BarPosition";

function position(sparse: boolean, bar = 1): BarPosition {
  return {
    bar,
    sectionIndex: 0,
    section: {sparse, kickBeats: [], bassSteps: [], melody: []},
    root: 38,
    start: 2,
    beat: 0.5,
  };
}

it("ticks a hi-hat on every eighth note of a full section", () => {
  assert.deepEqual(
    makeHats(position(false)).map(voice => voice.at),
    [2, 2.25, 2.5, 2.75, 3, 3.25, 3.5, 3.75],
  );
});

it("ticks only the third and seventh eighths of a sparse section", () => {
  assert.deepEqual(
    makeHats(position(true)).map(voice => voice.at),
    [2.5, 3.5],
  );
});

it("makes each hat a short highpassed noise tick, panned alternately and seeded from its bar and step", () => {
  const [first, second] = makeHats(position(false, 3));

  assert.deepEqual(first, {
    kind: "noise",
    at: 2,
    duration: 0.045,
    seed: 500 + 3 * 8,
    cutoff: 7500,
    filter: "highpass",
    gain: 0.1,
    pan: -0.32,
  });
  assert.equal(second?.kind === "noise" && second.seed, 500 + 3 * 8 + 1);
  assert.equal(second?.pan, 0.32);
});
