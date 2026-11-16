import {expect, it} from "vitest";
import {peakOf} from "@gunsmith/audio-studies/common/levels/peak/PeakOf";
import {renderCue} from "@gunsmith/audio-studies/synthesis/RenderCue";
import type {Cue} from "@gunsmith/audio-studies/common/types/Cue";

const RATE = 48000;
const beep: Cue = {
  key: "test-beep",
  duration: 0.25,
  channels: 1,
  peak: 0.5,
  voices: [{kind: "tone", at: 0.01, duration: 0.1, frequency: 440, gain: 0.9}],
};

function energy(samples: Float32Array): number {
  return samples.reduce((sum, sample) => sum + sample * sample, 0);
}

it("renders the cue's length in frames, and keeps its key", async () => {
  const rendered = await renderCue(beep);

  expect(rendered.key).toBe("test-beep");
  expect(rendered.channels.length).toBe(1);
  expect(rendered.channels[0]?.length).toBe(Math.round(0.25 * RATE));
});

it("rounds the length to a whole frame", async () => {
  const rendered = await renderCue({...beep, duration: 0.0123456});

  expect(rendered.channels[0]?.length).toBe(Math.round(0.0123456 * RATE));
});

it("scales the loudest sample to the cue's peak, however loud the voices were", async () => {
  const quiet = await renderCue({...beep, voices: [{kind: "tone", at: 0, duration: 0.1, frequency: 440, gain: 0.01}]});
  const loud = await renderCue({...beep, voices: [{kind: "tone", at: 0, duration: 0.1, frequency: 440, gain: 1}]});

  expect(Math.abs(peakOf(quiet.channels) - 0.5)).toBeLessThan(1e-6);
  expect(Math.abs(peakOf(loud.channels) - 0.5)).toBeLessThan(1e-6);
});

it("renders as many channels as the cue asks for, with the same peak across them", async () => {
  const rendered = await renderCue({
    ...beep,
    channels: 2,
    voices: [{kind: "tone", at: 0, duration: 0.1, frequency: 440, gain: 1, pan: -1}],
  });

  expect(rendered.channels.length).toBe(2);
  expect(Math.abs(peakOf(rendered.channels) - 0.5)).toBeLessThan(1e-6);
  expect(energy(rendered.channels[1] ?? new Float32Array(1))).toBe(0);
});

it("refuses a cue that renders as silence", async () => {
  await expect(renderCue({...beep, voices: []})).rejects.toThrow(/test-beep rendered silence/);
});

it("is not a loop unless it says so", async () => {
  expect((await renderCue(beep)).loop).toBe(undefined);
  expect((await renderCue({...beep, loop: true})).loop).toBe(true);
});

it("lets a note that rings past the end of a loop wrap onto its start, but not a cue that does not loop", async () => {
  const ringing: Cue = {...beep, voices: [{kind: "tone", at: 0.2, duration: 0.2, frequency: 440, gain: 1}]};
  const head = Math.floor(0.1 * RATE);
  const looped = await renderCue({...ringing, loop: true});
  const once = await renderCue(ringing);

  expect(energy(looped.channels[0]?.subarray(0, head) ?? new Float32Array(1))).toBeGreaterThan(0);
  expect(energy(once.channels[0]?.subarray(0, head) ?? new Float32Array(1))).toBe(0);
});

it("renders the same samples every time", async () => {
  expect(await renderCue(beep)).toStrictEqual(await renderCue(beep));
});
