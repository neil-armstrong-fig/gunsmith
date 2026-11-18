import {expect, it} from "vitest";
import {makeDrums} from "@gunsmith/audio-studies/generators/music/bar/drums/MakeDrums";
import type {BarPosition} from "@gunsmith/audio-studies/generators/music/bar/types/BarPosition";
import type {Voice} from "@gunsmith/audio-studies/common/types/Voice";

const BEAT = 0.5;

it("plays a kick, a falling thud, on each beat the section names", () => {
  const voices = makeDrums(position({}, {kickBeats: [0, 2]}));

  expect(kicks(voices).map(voice => voice.at)).toStrictEqual([4, 5]);
  expect(kicks(voices)[0]).toStrictEqual({
    kind: "tone",
    at: 4,
    duration: 0.3,
    frequency: 145,
    endFrequency: 49,
    gain: 0.65,
    cutoff: 900,
  });
});

it("plays a snare, a burst of noise, on beats two and four of every bar of a full section", () => {
  const voices = makeDrums(position({bar: 2}));

  expect(snares(voices).map(voice => voice.at)).toStrictEqual([4.5, 5.5]);
  expect(snares(voices)[0]).toStrictEqual({
    kind: "noise",
    at: 4.5,
    duration: 0.16,
    seed: 310 + 2 * 4 + 1,
    cutoff: 2600,
    gain: 0.25,
  });
});

it("plays the snare only on odd bars of a sparse section", () => {
  expect(snares(makeDrums(position({bar: 2}, {sparse: true}))).length).toBe(0);
  expect(snares(makeDrums(position({bar: 3}, {sparse: true}))).length).toBe(2);
});

it("seeds each snare from its bar and beat, so no two hits are the same noise", () => {
  const seeds = snares(makeDrums(position({bar: 5}))).map(voice => voice.kind === "noise" && voice.seed);

  expect(seeds).toStrictEqual([310 + 5 * 4 + 1, 310 + 5 * 4 + 3]);
});

it("puts each beat's kick before its snare, beat by beat", () => {
  const voices = makeDrums(position());

  expect(voices.map(voice => `${voice.kind}@${voice.at}`)).toStrictEqual([
    "tone@4",
    "tone@4.5",
    "noise@4.5",
    "tone@5",
    "tone@5.5",
    "noise@5.5",
  ]);
});

it("plays no kick at all when the section names no beats", () => {
  expect(kicks(makeDrums(position({}, {kickBeats: []}))).length).toBe(0);
});

function snares(voices: readonly Voice[]): Voice[] {
  return voices.filter(voice => voice.kind === "noise");
}

function kicks(voices: readonly Voice[]): Voice[] {
  return voices.filter(voice => voice.kind === "tone");
}

function position(overrides: Partial<BarPosition> = {}, section: Partial<BarPosition["section"]> = {}): BarPosition {
  return {
    bar: 2,
    sectionIndex: 0,
    section: {sparse: false, kickBeats: [0, 1, 2, 3], bassSteps: [], melody: [], ...section},
    root: 38,
    start: 4,
    beat: BEAT,
    ...overrides,
  };
}
