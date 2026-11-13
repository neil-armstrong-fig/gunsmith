import assert from "node:assert/strict";
import {it} from "node:test";
import {makeStep} from "@gunsmith/audio-studies/generators/effects/steps/MakeStep";
import {NOISE_SEED} from "@gunsmith/audio-studies/common/noise-seed/NoiseSeed";

it("names the cue for its stance and variant", () => {
  assert.equal(makeStep("stand", 0).key, "sfx-step-stand");
  assert.equal(makeStep("crouch", 2).key, "sfx-step-crouch-03");
});

it("is a short mono one-shot", () => {
  const cue = makeStep("stand", 0);

  assert.equal(cue.duration, 0.24);
  assert.equal(cue.channels, 1);
  assert.equal(cue.loop, undefined);
});

it("is louder and brighter standing than crouched", () => {
  const stand = makeStep("stand", 0);
  const crouch = makeStep("crouch", 0);

  assert.equal(stand.peak, 0.46);
  assert.equal(crouch.peak, 0.15);
  assert.equal(stand.voices[0]?.cutoff, 1900);
  assert.equal(crouch.voices[0]?.cutoff, 640);
});

it("is a noise thud and a low pitch drop, both filtered at the stance's cutoff", () => {
  const [thud, drop] = makeStep("stand", 0).voices;

  assert.deepEqual(thud, {kind: "noise", at: 0, duration: 0.19, seed: NOISE_SEED, cutoff: 1900, gain: 0.6});
  assert.deepEqual(drop, {
    kind: "tone",
    at: 0,
    duration: 0.17,
    frequency: 94,
    endFrequency: 70,
    cutoff: 1900,
    gain: 0.42,
  });
});

it("moves every variant a little: a different noise seed, a shorter thud, a later and higher drop", () => {
  const [thud, drop] = makeStep("stand", 3).voices;

  assert.equal(thud?.kind === "noise" && thud.seed, NOISE_SEED + 3);
  assert.equal(thud?.duration, 0.19 - 3 * 0.008);
  assert.equal(drop?.at, 3 * 0.002);
  assert.equal(drop?.kind === "tone" && drop.frequency, 94 + 3 * 3);
  assert.equal(drop?.kind === "tone" && drop.endFrequency, 70 + 3 * 2);
});
