import {expect, it} from "vitest";
import {makeDamageCandidates} from "@gunsmith/audio-studies/generators/effects/damage/MakeDamageCandidates";
import {MASTERING} from "@gunsmith/audio-studies/output/mastering/Mastering";

it("makes only the selected crunch", () => {
  expect(makeDamageCandidates().map(cue => cue.key)).toStrictEqual(["damage-crunch"]);
});

it("makes the same cue every time", () => {
  expect(makeDamageCandidates()).toStrictEqual(makeDamageCandidates());
});

it("makes dry mono one-shot cues, not loops", () => {
  for (const cue of makeDamageCandidates()) {
    expect(cue.channels, cue.key).toBe(1);
    expect(cue.loop, cue.key).toBe(undefined);
    expect(
      cue.voices.every(voice => voice.pan === undefined),
      `${cue.key} would say where the hit came from`,
    ).toBe(true);
  }
});

it("makes short cues, so a hit is felt and not heard as a phrase", () => {
  for (const cue of makeDamageCandidates()) {
    expect(cue.duration, cue.key).toBeGreaterThanOrEqual(0.12);
    expect(cue.duration, cue.key).toBeLessThanOrEqual(0.2);
  }
});

it("asks for a peak that is audible and inside the mastering peak", () => {
  for (const cue of makeDamageCandidates()) {
    expect(cue.peak, cue.key).toBeGreaterThan(0.1);
    expect(cue.peak, cue.key).toBeLessThanOrEqual(MASTERING.maxPeak);
  }
});
