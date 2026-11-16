import {expect, it} from "vitest";
import {makeStep} from "@gunsmith/audio-studies/generators/effects/steps/MakeStep";
import {NOISE_SEED} from "@gunsmith/audio-studies/common/noise-seed/NoiseSeed";

it("names the cue for its stance and variant", () => {
  expect(makeStep("stand", 0).key).toBe("sfx-step-stand");
  expect(makeStep("crouch", 2).key).toBe("sfx-step-crouch-03");
});

it("is a short mono one-shot", () => {
  const cue = makeStep("stand", 0);

  expect(cue.duration).toBe(0.24);
  expect(cue.channels).toBe(1);
  expect(cue.loop).toBe(undefined);
});

it("is louder and brighter standing than crouched", () => {
  const stand = makeStep("stand", 0);
  const crouch = makeStep("crouch", 0);

  expect(stand.peak).toBe(0.46);
  expect(crouch.peak).toBe(0.15);
  expect(stand.voices[0]?.cutoff).toBe(1900);
  expect(crouch.voices[0]?.cutoff).toBe(640);
});

it("is a noise thud and a low pitch drop, both filtered at the stance's cutoff", () => {
  const [thud, drop] = makeStep("stand", 0).voices;

  expect(thud).toStrictEqual({kind: "noise", at: 0, duration: 0.19, seed: NOISE_SEED, cutoff: 1900, gain: 0.6});
  expect(drop).toStrictEqual({
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

  expect(thud?.kind === "noise" && thud.seed).toBe(NOISE_SEED + 3);
  expect(thud?.duration).toBe(0.19 - 3 * 0.008);
  expect(drop?.at).toBe(3 * 0.002);
  expect(drop?.kind === "tone" && drop.frequency).toBe(94 + 3 * 3);
  expect(drop?.kind === "tone" && drop.endFrequency).toBe(70 + 3 * 2);
});
