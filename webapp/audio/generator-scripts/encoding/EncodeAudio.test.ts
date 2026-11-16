import {mkdtemp, readFile, readdir, rm, writeFile} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {afterEach, assert, beforeEach, expect, it} from "vitest";
import {encodeAudio} from "@gunsmith/audio-studies/encoding/EncodeAudio";
import {sourceOfOneEffect} from "@gunsmith/audio-studies/encoding/fixture/SourceOfOneEffect";
import {sha256Of} from "@gunsmith/audio-studies/encoding/hash/Sha256Of";
import {readEncodingReport} from "@gunsmith/audio-studies/encoding/report/ReadEncodingReport";

let folder = "";
let source = "";
let master: Buffer = Buffer.alloc(0);
let output = "";

beforeEach(async () => {
  folder = await mkdtemp(join(tmpdir(), "gunsmith-encode-"));
  ({source, master} = await sourceOfOneEffect(folder));
  output = join(folder, "output");
});

afterEach(async () => {
  await rm(folder, {recursive: true, force: true});
});

it("exports each master in both formats, with the report, and leaves the audition mix out", async () => {
  await encodeAudio({source, output});

  expect((await readdir(output)).sort()).toStrictEqual(["report.json", "sfx-ui-click.mp3", "sfx-ui-click.ogg"]);
});

it("only reads the master", async () => {
  await encodeAudio({source, output});

  expect(await readFile(join(source, "sfx-ui-click.wav"))).toStrictEqual(master);
});

it("records for each export the master it came from, its own hash and its size", async () => {
  await encodeAudio({source, output});
  const {files} = await readEncodingReport(output);

  expect(files.map(file => file.format)).toStrictEqual(["ogg", "mp3"]);
  for (const file of files) {
    const bytes = await readFile(join(output, `${file.key}.${file.format}`));
    expect(file.sourceSha256).toBe(sha256Of(master));
    expect(file.sha256).toBe(sha256Of(bytes));
    expect(file.bytes).toBe(bytes.length);
  }
});

it("records the arguments with file names in place of paths, and the build that ran", async () => {
  await encodeAudio({source, output});
  const report = await readEncodingReport(output);
  const ogg = report.files[0];

  expect(report.encoder).toMatch(/^ffmpeg version/);
  expect(report.sampleRate).toBe(48000);
  assert(ogg);
  expect(ogg.arguments.slice(4, 6)).toStrictEqual(["-i", "sfx-ui-click.wav"]);
  expect(ogg.arguments.at(-1)).toBe("sfx-ui-click.ogg");
});

it("removes the old reports before it starts, so a failed encode leaves none", async () => {
  await encodeAudio({source, output});
  await writeFile(join(output, "verification.json"), "{}");
  await writeFile(join(output, "browser-verification.json"), "[]");

  await expect(encodeAudio({source, output, ffmpeg: "/missing/audio-encoder"})).rejects.toThrow();
  expect((await readdir(output)).sort()).toStrictEqual(["sfx-ui-click.mp3", "sfx-ui-click.ogg"]);
});

it("refuses a master that is not the one that was measured, and publishes nothing", async () => {
  await writeFile(join(source, "sfx-ui-click.wav"), "corrupt");

  await expect(encodeAudio({source, output})).rejects.toThrow(/sfx-ui-click: master hash mismatch/);
  expect(await readdir(output)).toStrictEqual([]);
});
