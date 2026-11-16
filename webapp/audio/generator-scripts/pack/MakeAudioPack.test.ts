import {expect, it} from "vitest";
import {makeAudioPack} from "@gunsmith/audio-studies/pack/MakeAudioPack";

it("is seventeen effects, a 90-second match loop and a 60-second menu loop", () => {
  const pack = makeAudioPack();

  expect(pack.effects.length).toBe(17);
  expect(pack.match.key).toBe("music-loop-match");
  expect(pack.match.duration).toBe(90);
  expect(pack.menu.key).toBe("music-loop-menu");
  expect(pack.menu.duration).toBe(60);
});

it("gives every cue its own key", () => {
  const pack = makeAudioPack();
  const keys = [...pack.effects, pack.match, pack.menu].map(cue => cue.key);

  expect(new Set(keys).size).toBe(keys.length);
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
    expect(keys.has(key), key).toBe(true);
  }
});
