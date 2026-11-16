import {assert, expect, it} from "vitest";
import {makeEffects} from "@gunsmith/audio-studies/generators/effects/MakeEffects";

it("makes the eleven candidate effects and four pairs of footfalls, in a fixed order", () => {
  expect(makeEffects().map(cue => cue.key)).toStrictEqual([
    "sfx-pickup",
    "sfx-drop",
    "sfx-reload",
    "sfx-hit",
    "sfx-death",
    "sfx-ring-warning",
    "sfx-ui-click",
    "sfx-round-start",
    "sfx-round-end",
    "sfx-step-stand",
    "sfx-step-crouch",
    "sfx-step-stand-02",
    "sfx-step-crouch-02",
    "sfx-step-stand-03",
    "sfx-step-crouch-03",
    "sfx-step-stand-04",
    "sfx-step-crouch-04",
  ]);
});

it("makes every effect mono, one-shot, and with voices", () => {
  for (const cue of makeEffects()) {
    expect(cue.channels, cue.key).toBe(1);
    expect(cue.loop, cue.key).toBe(undefined);
    expect(cue.voices.length, cue.key).toBeGreaterThan(0);
    expect(cue.duration, cue.key).toBeGreaterThan(0);
  }
});

it("gives each effect the duration the art notes list", () => {
  const durations = Object.fromEntries(makeEffects().map(cue => [cue.key, cue.duration]));

  expect(durations["sfx-pickup"]).toBe(0.38);
  expect(durations["sfx-drop"]).toBe(0.34);
  expect(durations["sfx-reload"]).toBe(0.82);
  expect(durations["sfx-hit"]).toBe(0.2);
  expect(durations["sfx-death"]).toBe(1.35);
  expect(durations["sfx-ring-warning"]).toBe(2.8);
  expect(durations["sfx-ui-click"]).toBe(0.065);
  expect(durations["sfx-round-start"]).toBe(1.35);
  expect(durations["sfx-round-end"]).toBe(1.65);
});

it("provides four matched dry footfalls per stance with softer crouch filtering", () => {
  const effects = makeEffects();
  for (const suffix of ["", "-02", "-03", "-04"]) {
    const stand = effects.find(cue => cue.key === `sfx-step-stand${suffix}`);
    const crouch = effects.find(cue => cue.key === `sfx-step-crouch${suffix}`);
    assert(stand, `missing footfall pair ${suffix}`);
    assert(crouch, `missing footfall pair ${suffix}`);
    expect(stand.duration).toBe(0.24);
    expect(crouch.duration).toBe(0.24);
    expect(crouch.voices[0]?.cutoff ?? Infinity).toBeLessThan(stand.voices[0]?.cutoff ?? 0);
  }
});

it("makes the footfall variants differ from each other", () => {
  const effects = makeEffects();
  for (const stance of ["stand", "crouch"]) {
    const variants = ["", "-02", "-03", "-04"].map(suffix =>
      JSON.stringify(effects.find(cue => cue.key === `sfx-step-${stance}${suffix}`)?.voices),
    );

    expect(new Set(variants).size, `${stance}: duplicated variant`).toBe(4);
  }
});
