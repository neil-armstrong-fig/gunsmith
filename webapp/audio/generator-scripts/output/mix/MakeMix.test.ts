import assert from "node:assert/strict";
import {it} from "node:test";
import {STEP_VARIANTS, stepKey} from "@gunsmith/audio-studies/common/step-key/StepKey";
import {peakOf} from "@gunsmith/audio-studies/common/levels/peak/PeakOf";
import {makeMix} from "@gunsmith/audio-studies/output/mix/MakeMix";
import type {RenderedCue} from "@gunsmith/audio-studies/common/types/RenderedCue";

const RATE = 48000;
const SECONDS = 80;

function silentTrack(): RenderedCue {
  return {
    key: "music-loop-match",
    channels: [new Float32Array(SECONDS * RATE), new Float32Array(SECONDS * RATE)],
    loop: true,
  };
}

function pulse(key: string, level: number): RenderedCue {
  return {key, channels: [Float32Array.of(level, level, level, level)]};
}

// Every effect the mix uses, each a four-sample pulse at its own level, so a place in the mix says which effect is there.
function effects(): Map<string, RenderedCue> {
  const keys = ["sfx-pickup", "sfx-reload", "sfx-ring-warning", "sfx-hit"];
  for (const stance of ["stand", "crouch"] as const) {
    for (let variant = 0; variant < STEP_VARIANTS; variant += 1) {
      keys.push(stepKey(stance, variant));
    }
  }

  return new Map(keys.map((key, index) => [key, pulse(key, 0.01 * (index + 1))]));
}

function levelAt(mix: RenderedCue, seconds: number, channel = 0): number {
  return mix.channels[channel]?.[Math.round(seconds * RATE) + 1] ?? Number.NaN;
}

it("is the audition mix, and not a loop", () => {
  const mix = makeMix(silentTrack(), effects());

  assert.equal(mix.key, "audition-mix");
  assert.equal(mix.loop, undefined);
});

it("keeps the track's length and channel count", () => {
  const mix = makeMix(silentTrack(), effects());

  assert.equal(mix.channels.length, 2);
  assert.equal(mix.channels[0]?.length, SECONDS * RATE);
});

it("does not change the track it was given", () => {
  const track = silentTrack();

  makeMix(track, effects());

  assert.ok(track.channels.every(channel => channel.every(sample => sample === 0)));
});

it("places the pickup, reload, ring warning and hit at 1.2, 4.1, 7.2 and 12.3 seconds", () => {
  const mix = makeMix(silentTrack(), effects());
  const table = effects();

  assert.equal(levelAt(mix, 1.2), table.get("sfx-pickup")?.channels[0]?.[0]);
  assert.equal(levelAt(mix, 4.1), table.get("sfx-reload")?.channels[0]?.[0]);
  assert.equal(levelAt(mix, 7.2), table.get("sfx-ring-warning")?.channels[0]?.[0]);
  assert.equal(levelAt(mix, 12.3), table.get("sfx-hit")?.channels[0]?.[0]);
});

it("repeats the whole run of effects every 30 seconds, three times", () => {
  const mix = makeMix(silentTrack(), effects());
  const pickup = effects().get("sfx-pickup")?.channels[0]?.[0];

  assert.equal(levelAt(mix, 1.2 + 30), pickup);
  assert.equal(levelAt(mix, 1.2 + 60), pickup);
});

it("steps four standing footfalls from 2 seconds, 0.42 apart, one variant each", () => {
  const mix = makeMix(silentTrack(), effects());
  const table = effects();

  for (let variant = 0; variant < 4; variant += 1) {
    assert.equal(
      levelAt(mix, 2 + variant * 0.42),
      table.get(stepKey("stand", variant))?.channels[0]?.[0],
      `variant ${variant}`,
    );
  }
});

it("steps four crouched footfalls from 9.5 seconds, 0.65 apart, one variant each", () => {
  const mix = makeMix(silentTrack(), effects());
  const table = effects();

  for (let variant = 0; variant < 4; variant += 1) {
    assert.equal(
      levelAt(mix, 9.5 + variant * 0.65),
      table.get(stepKey("crouch", variant))?.channels[0]?.[0],
      `variant ${variant}`,
    );
  }
});

it("puts every effect in the centre, equally in both channels", () => {
  const mix = makeMix(silentTrack(), effects());

  assert.equal(levelAt(mix, 1.2, 0), levelAt(mix, 1.2, 1));
  assert.ok(levelAt(mix, 1.2, 0) > 0);
});

it("leaves the track alone between effects", () => {
  const mix = makeMix(silentTrack(), effects());

  assert.equal(levelAt(mix, 20), 0);
  assert.equal(levelAt(mix, 1.19), 0);
});

it("adds an effect to the music under it", () => {
  const track = silentTrack();
  for (const channel of track.channels) {
    channel.fill(0.1);
  }
  const mix = makeMix(track, effects());

  assert.ok(Math.abs(levelAt(mix, 1.2) - (0.1 + 0.01)) < 1e-6);
  assert.ok(Math.abs(levelAt(mix, 20) - 0.1) < 1e-6);
});

it("turns the whole mix down, evenly, so its loudest sample is 0.65, when it would be louder", () => {
  const track = silentTrack();
  track.channels[0]?.fill(0.8);
  track.channels[1]?.fill(0.4);
  const mix = makeMix(track, effects());

  assert.ok(Math.abs(peakOf(mix.channels) - 0.65) < 1e-6);
  assert.ok(Math.abs(levelAt(mix, 20, 0) / levelAt(mix, 20, 1) - 2) < 1e-5, "the balance between channels is kept");
});

it("leaves a mix alone that is already under 0.65", () => {
  const track = silentTrack();
  track.channels[0]?.fill(0.4);
  const mix = makeMix(track, effects());

  assert.ok(Math.abs(levelAt(mix, 20) - 0.4) < 1e-6);
});

it("drops an effect that would run past the end of the track, rather than failing", () => {
  const short: RenderedCue = {
    key: "music-loop-match",
    channels: [new Float32Array(2 * RATE), new Float32Array(2 * RATE)],
  };

  const mix = makeMix(short, effects());

  assert.equal(mix.channels[0]?.length, 2 * RATE);
  assert.ok(levelAt(mix, 1.2) > 0);
});

it("refuses a table that lacks an effect the mix needs", () => {
  const table = effects();
  table.delete("sfx-hit");

  assert.throws(() => makeMix(silentTrack(), table));
});
