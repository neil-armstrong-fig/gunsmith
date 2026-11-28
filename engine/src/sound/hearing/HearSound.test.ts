import {HEARING_RANGES} from "@gunsmith/engine/sound/hearing/ranges/HearingRanges";
import {hearSound} from "@gunsmith/engine/sound/hearing/HearSound";

const LISTENER = {x: 10, y: 10};

it("hears a sound within range as that sound from its sector, with its loudness", () => {
  expect(hearSound(LISTENER, {x: 15, y: 10}, "shot")).toEqual({
    kind: "heard",
    sound: "shot",
    sector: 2,
    loudness: "near",
  });
});

it("hears a sound exactly at the edge of its range, as far", () => {
  expect(hearSound(LISTENER, {x: 10 + HEARING_RANGES.step, y: 10}, "step")).toEqual({
    kind: "heard",
    sound: "step",
    sector: 2,
    loudness: "far",
  });
});

it("hears nothing beyond the range", () => {
  expect(hearSound(LISTENER, {x: 10 + HEARING_RANGES.pickup + 0.01, y: 10}, "pickup")).toBeUndefined();
});

it("gives each sound its own range: a shot is heard where a footfall is not", () => {
  const source = {x: 10 + HEARING_RANGES.step + 1, y: 10};

  expect(hearSound(LISTENER, source, "shot")).toBeDefined();
  expect(hearSound(LISTENER, source, "step")).toBeUndefined();
});

it("measures the range in a straight line, not along the axes", () => {
  const along = HEARING_RANGES.shot * 0.8;

  expect(hearSound(LISTENER, {x: 10 + along, y: 10 + along}, "shot")).toBeUndefined();
});

it("says the sound and sector it came from, and nothing that could give away a place", () => {
  expect(Object.keys(hearSound(LISTENER, {x: 12, y: 13}, "pickup") ?? {}).sort()).toEqual([
    "kind",
    "loudness",
    "sector",
    "sound",
  ]);
});
