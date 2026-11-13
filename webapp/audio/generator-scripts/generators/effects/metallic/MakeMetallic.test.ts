import assert from "node:assert/strict";
import {it} from "node:test";
import {makeMetallic} from "@gunsmith/audio-studies/generators/effects/metallic/MakeMetallic";

const effect = {
  key: "sfx-test",
  duration: 0.5,
  notes: [
    [0, 400, 0.2],
    [0.1, 500, 0.3],
  ],
} as const;

it("keeps the key and duration, and is a mono one-shot at the metallic peak", () => {
  const cue = makeMetallic(effect);

  assert.equal(cue.key, "sfx-test");
  assert.equal(cue.duration, 0.5);
  assert.equal(cue.channels, 1);
  assert.equal(cue.peak, 0.52);
  assert.equal(cue.loop, undefined);
});

it("strikes each note with a triangle body, a bright overtone and a click, in that order", () => {
  const [body, overtone, click] = makeMetallic(effect).voices;

  assert.deepEqual(body, {kind: "tone", at: 0, frequency: 400, duration: 0.2, gain: 0.8, wave: "triangle"});
  assert.deepEqual(overtone, {kind: "tone", at: 0, frequency: 400 * 2.71, duration: 0.2 * 0.7, gain: 0.22});
  assert.deepEqual(click, {
    kind: "noise",
    at: 0,
    duration: 0.04,
    seed: 400,
    cutoff: 4800,
    filter: "highpass",
    gain: 0.18,
  });
});

it("makes three voices for every note, note by note", () => {
  const cue = makeMetallic(effect);

  assert.equal(cue.voices.length, 6);
  assert.deepEqual(
    cue.voices.map(voice => voice.at),
    [0, 0, 0, 0.1, 0.1, 0.1],
  );
});

it("seeds each click from its note's pitch, rounded, so every strike clicks differently", () => {
  const clicks = makeMetallic({...effect, notes: [[0, 293.66, 0.2]]}).voices.filter(voice => voice.kind === "noise");

  assert.deepEqual(
    clicks.map(voice => voice.kind === "noise" && voice.seed),
    [294],
  );
});
