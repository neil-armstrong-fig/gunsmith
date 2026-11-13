import assert from "node:assert/strict";
import {it} from "node:test";
import {makeAudioPack} from "@gunsmith/audio-studies/pack/MakeAudioPack";

it("is seventeen effects, a 90-second match loop and a 60-second menu loop", () => {
  const pack = makeAudioPack();

  assert.equal(pack.effects.length, 17);
  assert.equal(pack.match.key, "music-loop-match");
  assert.equal(pack.match.duration, 90);
  assert.equal(pack.menu.key, "music-loop-menu");
  assert.equal(pack.menu.duration, 60);
});

it("gives every cue its own key", () => {
  const pack = makeAudioPack();
  const keys = [...pack.effects, pack.match, pack.menu].map(cue => cue.key);

  assert.equal(new Set(keys).size, keys.length);
});

it("has every effect the audition mix needs", () => {
  const keys = new Set(makeAudioPack().effects.map(cue => cue.key));

  for (const key of [
    "sfx-pickup",
    "sfx-reload",
    "sfx-ring-warning",
    "sfx-hit",
    "sfx-step-stand",
    "sfx-step-crouch-04",
  ]) {
    assert.ok(keys.has(key), key);
  }
});
