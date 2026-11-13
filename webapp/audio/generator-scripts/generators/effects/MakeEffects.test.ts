import assert from "node:assert/strict";
import {it} from "node:test";
import {makeEffects} from "@gunsmith/audio-studies/generators/effects/MakeEffects";

it("makes the eleven candidate effects and four pairs of footfalls, in a fixed order", () => {
  assert.deepEqual(
    makeEffects().map(cue => cue.key),
    [
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
    ],
  );
});

it("makes every effect mono, one-shot, and with voices", () => {
  for (const cue of makeEffects()) {
    assert.equal(cue.channels, 1, cue.key);
    assert.equal(cue.loop, undefined, cue.key);
    assert.ok(cue.voices.length > 0, cue.key);
    assert.ok(cue.duration > 0, cue.key);
  }
});

it("gives each effect the duration the art notes list", () => {
  const durations = Object.fromEntries(makeEffects().map(cue => [cue.key, cue.duration]));

  assert.equal(durations["sfx-pickup"], 0.38);
  assert.equal(durations["sfx-drop"], 0.34);
  assert.equal(durations["sfx-reload"], 0.82);
  assert.equal(durations["sfx-hit"], 0.2);
  assert.equal(durations["sfx-death"], 1.35);
  assert.equal(durations["sfx-ring-warning"], 2.8);
  assert.equal(durations["sfx-ui-click"], 0.065);
  assert.equal(durations["sfx-round-start"], 1.35);
  assert.equal(durations["sfx-round-end"], 1.65);
});

it("provides four matched dry footfalls per stance with softer crouch filtering", () => {
  const effects = makeEffects();
  for (const suffix of ["", "-02", "-03", "-04"]) {
    const stand = effects.find(cue => cue.key === `sfx-step-stand${suffix}`);
    const crouch = effects.find(cue => cue.key === `sfx-step-crouch${suffix}`);
    assert.ok(stand && crouch, `missing footfall pair ${suffix}`);
    assert.equal(stand.duration, 0.24);
    assert.equal(crouch.duration, 0.24);
    assert.ok((crouch.voices[0]?.cutoff ?? Infinity) < (stand.voices[0]?.cutoff ?? 0));
  }
});

it("makes the footfall variants differ from each other", () => {
  const effects = makeEffects();
  for (const stance of ["stand", "crouch"]) {
    const variants = ["", "-02", "-03", "-04"].map(suffix =>
      JSON.stringify(effects.find(cue => cue.key === `sfx-step-${stance}${suffix}`)?.voices),
    );

    assert.equal(new Set(variants).size, 4, `${stance}: duplicated variant`);
  }
});
