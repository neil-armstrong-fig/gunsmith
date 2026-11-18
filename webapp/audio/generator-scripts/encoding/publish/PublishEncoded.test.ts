import {mkdir, mkdtemp, readFile, readdir, rm, writeFile} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {afterEach, beforeEach, expect, it} from "vitest";
import {publishEncoded} from "@gunsmith/audio-studies/encoding/publish/PublishEncoded";
import type {EncodedFile} from "@gunsmith/audio-studies/encoding/types/EncodedFile";
import type {EncodingReport} from "@gunsmith/audio-studies/encoding/types/EncodingReport";

let folder = "";
let staging = "";
let output = "";

beforeEach(async () => {
  folder = await mkdtemp(join(tmpdir(), "gunsmith-publish-"));
  staging = join(folder, "staging");
  output = join(folder, "output");
  await mkdir(staging);
  await mkdir(output);
});

afterEach(async () => {
  await rm(folder, {recursive: true, force: true});
});

const REPORT: EncodingReport = {encoder: "ffmpeg test", sampleRate: 48000, files: [fileOf("ogg"), fileOf("mp3")]};

it("copies every staged export and then writes the report", async () => {
  await writeFile(join(staging, "sfx-hit.ogg"), "ogg bytes");
  await writeFile(join(staging, "sfx-hit.mp3"), "mp3 bytes");
  await publishEncoded({staging, output, report: REPORT});

  expect((await readdir(output)).sort()).toStrictEqual(["report.json", "sfx-hit.mp3", "sfx-hit.ogg"]);
  expect(await readFile(join(output, "sfx-hit.ogg"), "utf8")).toBe("ogg bytes");
  expect(JSON.parse(await readFile(join(output, "report.json"), "utf8"))).toStrictEqual(REPORT);
});

it("writes no report when an export is missing, so a report never vouches for what is not there", async () => {
  await writeFile(join(staging, "sfx-hit.ogg"), "ogg bytes");

  await expect(publishEncoded({staging, output, report: REPORT})).rejects.toThrow();
  expect((await readdir(output)).includes("report.json")).toBe(false);
});

function fileOf(format: EncodedFile["format"]): EncodedFile {
  return {key: "sfx-hit", format, sourceSha256: "s", sha256: "h", bytes: 1, channels: 1, seconds: 1, arguments: []};
}
