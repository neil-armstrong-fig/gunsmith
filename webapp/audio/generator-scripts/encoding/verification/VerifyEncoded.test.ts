import {mkdir, mkdtemp, readFile, readdir, rm, writeFile} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {afterEach, beforeEach, expect, it} from "vitest";
import {encodeAudio} from "@gunsmith/audio-studies/encoding/EncodeAudio";
import {shimEncoder} from "@gunsmith/audio-studies/encoding/verification/shim/ShimEncoder";
import {sourceOfOneEffect} from "@gunsmith/audio-studies/encoding/fixture/SourceOfOneEffect";
import {readEncodingReport} from "@gunsmith/audio-studies/encoding/report/ReadEncodingReport";
import {writeReport} from "@gunsmith/audio-studies/encoding/report/WriteReport";
import {verifyEncoded} from "@gunsmith/audio-studies/encoding/verification/VerifyEncoded";
import type {VerificationReport} from "@gunsmith/audio-studies/encoding/verification/types/VerificationReport";

let folder = "";
let output = "";

beforeEach(async () => {
  folder = await mkdtemp(join(tmpdir(), "gunsmith-verify-"));
  const {source} = await sourceOfOneEffect(folder);
  output = join(folder, "output");
  await encodeAudio({source, output});
});

afterEach(async () => {
  await rm(folder, {recursive: true, force: true});
});

it("passes exports that are the ones reported, and says so in verification.json", async () => {
  await verifyEncoded(output);
  const verification = await verificationOf(output);

  expect(verification.passed).toBe(true);
  expect(verification.failures).toStrictEqual([]);
  expect(Object.keys(verification.files)).toStrictEqual(["sfx-ui-click.ogg", "sfx-ui-click.mp3"]);
  expect(verification.decoder).toMatch(/^ffmpeg version/);
});

it("stops at an export that is not the reported one, and writes no verification", async () => {
  await writeFile(join(output, "sfx-ui-click.mp3"), "truncated");

  await expect(verifyEncoded(output)).rejects.toThrow(/sfx-ui-click.mp3: hash mismatch/);
  expect((await readdir(output)).includes("verification.json")).toBe(false);
});

it("removes an old verification before it checks, so a stop never leaves a passing one", async () => {
  await verifyEncoded(output);
  await writeFile(join(output, "sfx-ui-click.mp3"), "truncated");

  await expect(verifyEncoded(output)).rejects.toThrow();
  expect((await readdir(output)).includes("verification.json")).toBe(false);
});

it("refuses a report that names a file this package would never write", async () => {
  const report = await readEncodingReport(output);
  await writeReport(join(output, "report.json"), {
    ...report,
    files: report.files.map(file => ({...file, key: "../sfx-ui-click"})),
  });

  await expect(verifyEncoded(output)).rejects.toThrow(/Invalid export name/);
});

it("records a finding, writes the report with passed false, and then fails", async () => {
  const report = await readEncodingReport(output);
  await writeReport(join(output, "report.json"), {...report, files: report.files.map(file => ({...file, seconds: 1}))});

  await expect(verifyEncoded(output)).rejects.toThrow(/sfx-ui-click.mp3: duration mismatch/);
  const verification = await verificationOf(output);
  expect(verification.passed).toBe(false);
  expect(verification.failures.length).toBe(2);
});

it("runs the encoder it is given for the version, the probe and the decode, and no other", async () => {
  const encoder = await shimEncoder(folder);
  await verifyEncoded(output, encoder);
  const calls = (await readFile(join(folder, "calls.log"), "utf8")).split("\n");

  expect(calls, "the version").toContain("ffmpeg -version");
  expect(calls, "the probe").toContain("ffprobe -v");
  expect(calls, "the decode").toContain("ffmpeg -v");
});

it("fails when the encoder it is given cannot be run", async () => {
  await expect(verifyEncoded(output, "/missing/ffmpeg")).rejects.toThrow(/ENOENT/);
});

it("keeps the hit cue at its measured length in both formats", async () => {
  const hitFolder = join(folder, "hit");
  await mkdir(hitFolder);
  const {source} = await sourceOfOneEffect(hitFolder, "sfx-hit");
  const hitOutput = join(hitFolder, "output");
  await encodeAudio({source, output: hitOutput});

  await verifyEncoded(hitOutput);
  const verification = await verificationOf(hitOutput);

  expect(verification.passed).toBe(true);
  expect(verification.files["sfx-hit.ogg"]?.frames).toBe(9600);
  expect(verification.files["sfx-hit.mp3"]?.frames).toBe(9600);
});

async function verificationOf(folderOfExports: string): Promise<VerificationReport> {
  return JSON.parse(await readFile(join(folderOfExports, "verification.json"), "utf8")) as VerificationReport;
}
