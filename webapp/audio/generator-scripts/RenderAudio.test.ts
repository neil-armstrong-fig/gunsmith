import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {mkdtemp, readdir, readFile, rm} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {after, before, it} from "node:test";
import {OfflineAudioContext} from "node-web-audio-api";
import {STEP_VARIANTS, stepKey} from "@gunsmith/audio-studies/common/step-key/StepKey";
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

function tinyEffect(key: string): Cue {
  return {
    key,
    duration: 0.05,
    channels: 1,
    peak: 0.3,
    voices: [{kind: "tone", at: 0, duration: 0.04, frequency: 500, gain: 1}],
  };
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

const pack: AudioPack = {
  effects: EFFECT_KEYS.map(tinyEffect),
  match: tinyLoop("music-loop-match"),
  menu: tinyLoop("music-loop-menu"),
};

let folder = "";

before(async () => {
  folder = await mkdtemp(join(tmpdir(), "gunsmith-audio-"));
});

after(async () => {
  await rm(folder, {recursive: true, force: true});
});

function channelsOf(key: string): number {
  if (key.startsWith("sfx-")) {
    return 1;
  }

  return 2;
}

it("renders every effect, both loops and the audition mix, and says how many files that is", async () => {
  const output = join(folder, "first");

  const count = await renderAudio(output, pack);
  const wavs = (await readdir(output)).filter(file => file.endsWith(".wav")).sort();

  assert.equal(count, EFFECT_KEYS.length + 3);
  assert.equal(wavs.length, count);
  assert.deepEqual(
    wavs,
    [...EFFECT_KEYS, "music-loop-match", "music-loop-menu", "audition-mix"].map(key => `${key}.wav`).sort(),
  );
});

it("creates the output folder, however deep, when it does not exist", async () => {
  const output = join(folder, "does", "not", "exist");

  await renderAudio(output, pack);

  assert.ok((await readdir(output)).includes("measurements.json"));
});

it("records the measurements in render order: effects, match, menu, then the mix", async () => {
  const output = join(folder, "order");
  await renderAudio(output, pack);

  assert.deepEqual(Object.keys((await readMeasurements(output)).files), [
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

    assert.equal(createHash("sha256").update(wav).digest("hex"), measurement.sha256, key);
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

    assert.equal(decoded.numberOfChannels, channelsOf(key), key);
    assert.equal(decoded.length, frames, key);
  }
});

it("measures the join of the loops, and of nothing else", async () => {
  const output = join(folder, "seams");
  await renderAudio(output, pack);
  const {files} = await readMeasurements(output);

  assert.notEqual(files["music-loop-match"]?.seamJumpDbfs, undefined);
  assert.notEqual(files["music-loop-menu"]?.seamJumpDbfs, undefined);
  assert.equal(files["sfx-pickup"]?.seamJumpDbfs, undefined);
  assert.equal(files["audition-mix"]?.seamJumpDbfs, undefined);
});

it("makes the audition mix as long as the match track it is laid over", async () => {
  const output = join(folder, "mix");
  await renderAudio(output, pack);
  const {files} = await readMeasurements(output);

  assert.equal(files["audition-mix"]?.seconds, files["music-loop-match"]?.seconds);
});

it("renders the same bytes every time", async () => {
  const [first, second] = [join(folder, "again-1"), join(folder, "again-2")];
  await renderAudio(first, pack);
  await renderAudio(second, pack);

  for (const file of await readdir(first)) {
    assert.deepEqual(await readFile(join(first, file)), await readFile(join(second, file)), file);
  }
});
