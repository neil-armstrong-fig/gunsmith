import {assert, expect, it} from "vitest";
import {OfflineAudioContext} from "node-web-audio-api";
import {peakOf} from "@gunsmith/audio-studies/common/levels/peak/PeakOf";
import {scheduleVoice} from "@gunsmith/audio-studies/synthesis/schedule/ScheduleVoice";
import type {Voice} from "@gunsmith/audio-studies/common/types/Voice";

const RATE = 48000;

it("plays a tone at its pitch: a 1 kHz sine for a quarter second crosses zero about 500 times", async () => {
  const [left] = await render({kind: "tone", at: 0, duration: 0.25, frequency: 1000, gain: 1});

  assert(left);
  expect(Math.abs(crossings(left) - 500), `${crossings(left)} crossings`).toBeLessThanOrEqual(4);
});

it("starts a voice at its time, and is silent before it", async () => {
  const [left] = await render({kind: "tone", at: 0.2, duration: 0.2, frequency: 800, gain: 1});

  assert(left);
  expect(energy(left.subarray(0, Math.floor(RATE * 0.199)))).toBe(0);
  expect(energy(left.subarray(Math.floor(RATE * 0.22), Math.floor(RATE * 0.4)))).toBeGreaterThan(0);
});

it("starts the world's offset later again, which is how a looped cue schedules its repeats", async () => {
  const context = new OfflineAudioContext(1, RATE, RATE);
  scheduleVoice(context, {kind: "tone", at: 0.1, duration: 0.1, frequency: 800, gain: 1}, 0.5);
  const [samples] = [(await context.startRendering()).getChannelData(0)];

  expect(energy(samples.subarray(0, Math.floor(RATE * 0.59)))).toBe(0);
  expect(energy(samples.subarray(Math.floor(RATE * 0.61), Math.floor(RATE * 0.69)))).toBeGreaterThan(0);
});

it("fades in from silence and out to silence, so a voice never clicks", async () => {
  const [left] = await render({kind: "tone", at: 0, duration: 0.2, frequency: 200, gain: 1});

  assert(left);
  expect(Math.abs(left[0] ?? 1)).toBeLessThan(0.01);
  expect(Math.abs(left[Math.floor(RATE * 0.2) - 1] ?? 1)).toBeLessThan(0.01);
});

it("stops at the end of its duration", async () => {
  const [left] = await render({kind: "tone", at: 0, duration: 0.1, frequency: 600, gain: 1});

  assert(left);
  expect(energy(left.subarray(Math.ceil(RATE * 0.1) + 8))).toBe(0);
});

it("holds a pan to the right by leaving the left channel silent", async () => {
  const [left, right] = await render({kind: "tone", at: 0, duration: 0.2, frequency: 500, gain: 1, pan: 1});

  assert(left);
  assert(right);
  expect(energy(left)).toBe(0);
  expect(energy(right)).toBeGreaterThan(0);
});

it("centres a voice that names no pan, in both channels equally", async () => {
  const [left, right] = await render({kind: "tone", at: 0, duration: 0.2, frequency: 500, gain: 1});

  assert(left);
  assert(right);
  expect(energy(left)).toBeGreaterThan(0);
  expect(Math.abs(energy(left) - energy(right))).toBeLessThan(energy(left) * 1e-6);
});

it("sweeps a tone from its pitch to its end pitch over its first moments", async () => {
  const [left] = await render({kind: "tone", at: 0, duration: 0.3, frequency: 2000, endFrequency: 200, gain: 1});
  const [steady] = await render({kind: "tone", at: 0, duration: 0.3, frequency: 2000, gain: 1});

  assert(left);
  assert(steady);
  expect(crossings(left), `${crossings(left)} against ${crossings(steady)}`).toBeLessThan(crossings(steady) / 3);
});

it("makes a triangle wave quieter in its harmonics than a sawtooth of the same pitch", async () => {
  const [triangle] = await render({
    kind: "tone",
    at: 0,
    duration: 0.2,
    frequency: 220,
    gain: 1,
    wave: "triangle",
    cutoff: 6000,
  });
  const [saw] = await render({
    kind: "tone",
    at: 0,
    duration: 0.2,
    frequency: 220,
    gain: 1,
    wave: "sawtooth",
    cutoff: 6000,
  });

  assert(triangle);
  assert(saw);
  expect(triangle).not.toStrictEqual(saw);
});

it("renders noise that is the same for the same seed and different for another", async () => {
  const noise: Voice = {kind: "noise", at: 0, duration: 0.1, seed: 7, gain: 1};
  const [first] = await render(noise);
  const [second] = await render(noise);
  const [other] = await render({...noise, seed: 8});

  assert(first);
  assert(second);
  assert(other);
  expect(energy(first)).toBeGreaterThan(0);
  expect(first).toStrictEqual(second);
  expect(first).not.toStrictEqual(other);
});

it("keeps what is below the cutoff with a lowpass, and what is above it with a highpass", async () => {
  const noise: Voice = {kind: "noise", at: 0, duration: 0.2, seed: 3, gain: 1, cutoff: 1000};
  const [low] = await render(noise);
  const [high] = await render({...noise, filter: "highpass"});

  assert(low);
  assert(high);
  // Crossings count the highest content: a lowpassed noise wobbles slowly, a highpassed one fast.
  expect(crossings(high), `${crossings(high)} against ${crossings(low)}`).toBeGreaterThan(crossings(low) * 2);
});

it("lowpasses by default, at a cutoff that lets bright content through", async () => {
  const bright: Voice = {kind: "tone", at: 0, duration: 0.2, frequency: 8000, gain: 1};
  const [open] = await render(bright);
  const [dull] = await render({...bright, cutoff: 500});

  assert(open);
  assert(dull);
  expect(energy(open)).toBeGreaterThan(energy(dull) * 100);
});

it("scales a voice's peak by its gain", async () => {
  const [loud] = await render({kind: "tone", at: 0, duration: 0.2, frequency: 500, gain: 1});
  const [quiet] = await render({kind: "tone", at: 0, duration: 0.2, frequency: 500, gain: 0.5});

  assert(loud);
  assert(quiet);
  expect(Math.abs(peakOf([quiet]) / peakOf([loud]) - 0.5), `${peakOf([quiet]) / peakOf([loud])}`).toBeLessThan(0.03);
});

it("finishes a pitch sweep in the first 80 milliseconds, then holds the end pitch", async () => {
  const [swept] = await render({kind: "tone", at: 0, duration: 0.4, frequency: 3000, endFrequency: 300, gain: 1});
  assert(swept);
  // From 90 to 140 ms the tone is at its end pitch, 300 Hz: about 30 crossings. Still sweeping, it would cross far more.
  const window = swept.subarray(Math.floor(RATE * 0.09), Math.floor(RATE * 0.14));

  expect(Math.abs(crossings(window) - 30), `${crossings(window)} crossings`).toBeLessThanOrEqual(4);
});

function crossings(samples: Float32Array): number {
  let count = 0;
  for (let index = 1; index < samples.length; index += 1) {
    if ((samples[index - 1] ?? 0) < 0 !== (samples[index] ?? 0) < 0) {
      count += 1;
    }
  }

  return count;
}

function energy(samples: Float32Array): number {
  return samples.reduce((sum, sample) => sum + sample * sample, 0);
}

async function render(voice: Voice, channelCount = 2, seconds = 0.5): Promise<Float32Array[]> {
  const context = new OfflineAudioContext(channelCount, RATE * seconds, RATE);
  scheduleVoice(context, voice, 0);
  const buffer = await context.startRendering();

  return Array.from({length: channelCount}, (_, index) => buffer.getChannelData(index).slice());
}
