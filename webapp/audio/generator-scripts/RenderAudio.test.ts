import {createHash} from "node:crypto";
import {mkdtemp, readdir, readFile, rm} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {afterAll, beforeAll, expect, it} from "vitest";
import {OfflineAudioContext} from "node-web-audio-api";
import {STEP_VARIANTS} from "@gunsmith/audio-studies/common/step-key/StepVariants";
import {stepKey} from "@gunsmith/audio-studies/common/step-key/StepKey";
import {readMeasurements} from "@gunsmith/audio-studies/output/measurements/read/ReadMeasurements";
import {renderAudio} from "@gunsmith/audio-studies/RenderAudio";
import type {AudioPack} from "@gunsmith/audio-studies/pack/types/AudioPack";
import type {Cue} from "@gunsmith/audio-studies/common/types/Cue";

// A pack the size of a postage stamp, with the same shape as the real one: every effect the audition mix asks for, and two
// short loops. It runs the whole pipeline in a fraction of a second; the real pack takes minutes (`RenderedPack.test.ts`).
const EFFECT_KEYS = [
  "sfx-pickup",
  "sfx-reload",
  "sfx-ring-warning",
  "sfx-hit",
  ...(["stand", "crouch"] as const).flatMap(stance =>
    Array.from({length: STEP_VARIANTS}, (_, variant) => stepKey(stance, variant)),
  ),
];

const pack: AudioPack = {
  effects: EFFECT_KEYS.map(tinyEffect),
  match: tinyLoop("music-loop-match"),
  menu: tinyLoop("music-loop-menu"),
};

let folder = "";

beforeAll(async () => {
  folder = await mkdtemp(join(tmpdir(), "gunsmith-audio-"));
});

afterAll(async () => {
  await rm(folder, {recursive: true, force: true});
});

it("renders every effect, both loops and the audition mix, and says how many files that is", async () => {
  const output = join(folder, "first");

  const count = await renderAudio(output, pack);
  const wavs = (await readdir(output)).filter(file => file.endsWith(".wav")).sort();

  expect(count).toBe(EFFECT_KEYS.length + 3);
  expect(wavs.length).toBe(count);
  expect(wavs).toStrictEqual(
    [...EFFECT_KEYS, "music-loop-match", "music-loop-menu", "audition-mix"].map(key => `${key}.wav`).sort(),
  );
});

it("creates the output folder, however deep, when it does not exist", async () => {
  const output = join(folder, "does", "not", "exist");

  await renderAudio(output, pack);

  expect(await readdir(output)).toContain("measurements.json");
});

it("records the measurements in render order: effects, match, menu, then the mix", async () => {
  const output = join(folder, "order");
  await renderAudio(output, pack);

  expect(Object.keys((await readMeasurements(output)).files)).toStrictEqual([
    ...EFFECT_KEYS,
    "music-loop-match",
    "music-loop-menu",
    "audition-mix",
  ]);
});

it("records the hash of every file it wrote", async () => {
  const output = join(folder, "hashes");
  await renderAudio(output, pack);

  for (const [key, measurement] of Object.entries((await readMeasurements(output)).files)) {
    const wav = await readFile(join(output, `${key}.wav`));

    expect(createHash("sha256").update(wav).digest("hex"), key).toBe(measurement.sha256);
  }
});

it("writes files a standard decoder accepts: effects in mono, loops and the mix in stereo", async () => {
  const output = join(folder, "decode");
  await renderAudio(output, pack);

  for (const key of ["sfx-pickup", "music-loop-match", "audition-mix"]) {
    const wav = await readFile(join(output, `${key}.wav`));
    const channels = wav.readUInt16LE(22);
    const frames = (wav.length - 44) / (channels * 2);
    const decoded = await new OfflineAudioContext(channels, frames, 48000).decodeAudioData(Uint8Array.from(wav).buffer);

    expect(decoded.numberOfChannels, key).toBe(channelsOf(key));
    expect(decoded.length, key).toBe(frames);
  }
});

it("measures the join of the loops, and of nothing else", async () => {
  const output = join(folder, "seams");
  await renderAudio(output, pack);
  const {files} = await readMeasurements(output);

  expect(files["music-loop-match"]?.seamJumpDbfs).not.toBe(undefined);
  expect(files["music-loop-menu"]?.seamJumpDbfs).not.toBe(undefined);
  expect(files["sfx-pickup"]?.seamJumpDbfs).toBe(undefined);
  expect(files["audition-mix"]?.seamJumpDbfs).toBe(undefined);
});

it("makes the audition mix as long as the match track it is laid over", async () => {
  const output = join(folder, "mix");
  await renderAudio(output, pack);
  const {files} = await readMeasurements(output);

  expect(files["audition-mix"]?.seconds).toBe(files["music-loop-match"]?.seconds);
});

it("renders the same bytes every time", async () => {
  const [first, second] = [join(folder, "again-1"), join(folder, "again-2")];
  await renderAudio(first, pack);
  await renderAudio(second, pack);

  for (const file of await readdir(first)) {
    expect(await readFile(join(first, file)), file).toStrictEqual(await readFile(join(second, file)));
  }
});

function channelsOf(key: string): number {
  if (key.startsWith("sfx-")) {
    return 1;
  }

  return 2;
}

function tinyLoop(key: string): Cue {
  return {
    key,
    duration: 0.5,
    channels: 2,
    peak: 0.25,
    loop: true,
    voices: [{kind: "tone", at: 0.1, duration: 0.2, frequency: 300, gain: 1, pan: -0.5}],
  };
}

function tinyEffect(key: string): Cue {
  return {
    key,
    duration: 0.05,
    channels: 1,
    peak: 0.3,
    voices: [{kind: "tone", at: 0, duration: 0.04, frequency: 500, gain: 1}],
  };
}
