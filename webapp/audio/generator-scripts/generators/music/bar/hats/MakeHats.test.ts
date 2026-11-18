import {expect, it} from "vitest";
import {makeHats} from "@gunsmith/audio-studies/generators/music/bar/hats/MakeHats";
import type {BarPosition} from "@gunsmith/audio-studies/generators/music/bar/types/BarPosition";

it("ticks a hi-hat on every eighth note of a full section", () => {
  expect(makeHats(position(false)).map(voice => voice.at)).toStrictEqual([2, 2.25, 2.5, 2.75, 3, 3.25, 3.5, 3.75]);
});

it("ticks only the third and seventh eighths of a sparse section", () => {
  expect(makeHats(position(true)).map(voice => voice.at)).toStrictEqual([2.5, 3.5]);
});

it("makes each hat a short highpassed noise tick, panned alternately and seeded from its bar and step", () => {
  const [first, second] = makeHats(position(false, 3));

  expect(first).toStrictEqual({
    kind: "noise",
    at: 2,
    duration: 0.045,
    seed: 500 + 3 * 8,
    cutoff: 7500,
    filter: "highpass",
    gain: 0.1,
    pan: -0.32,
  });
  expect(second?.kind === "noise" && second.seed).toBe(500 + 3 * 8 + 1);
  expect(second?.pan).toBe(0.32);
});

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
