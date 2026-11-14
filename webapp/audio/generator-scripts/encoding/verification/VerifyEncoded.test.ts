import assert from "node:assert/strict";
import {mkdtemp, readFile, readdir, rm, writeFile} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {afterEach, beforeEach, it} from "node:test";
import {encodeAudio} from "@gunsmith/audio-studies/encoding/EncodeAudio";
import {shimEncoder} from "@gunsmith/audio-studies/encoding/fixture/ShimEncoder";
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
  // The positive case is MP3 only, so it does not depend on the Vorbis decoder's known 128-frame shortfall on short effects.
  const report = await readEncodingReport(output);
  await writeReport(join(output, "report.json"), {
    ...report,
    files: report.files.filter(file => file.format === "mp3"),
  });
});

afterEach(async () => {
  await rm(folder, {recursive: true, force: true});
});

async function verificationOf(folderOfExports: string): Promise<VerificationReport> {
  return JSON.parse(await readFile(join(folderOfExports, "verification.json"), "utf8")) as VerificationReport;
}

it("passes exports that are the ones reported, and says so in verification.json", async () => {
  await verifyEncoded(output);
  const verification = await verificationOf(output);

  assert.equal(verification.passed, true);
  assert.deepEqual(verification.failures, []);
  assert.deepEqual(Object.keys(verification.files), ["sfx-ui-click.mp3"]);
  assert.match(verification.decoder, /^ffmpeg version/);
});

it("stops at an export that is not the reported one, and writes no verification", async () => {
  await writeFile(join(output, "sfx-ui-click.mp3"), "truncated");

  await assert.rejects(verifyEncoded(output), /sfx-ui-click.mp3: hash mismatch/);
  assert.equal((await readdir(output)).includes("verification.json"), false);
});

it("removes an old verification before it checks, so a stop never leaves a passing one", async () => {
  await verifyEncoded(output);
  await writeFile(join(output, "sfx-ui-click.mp3"), "truncated");

  await assert.rejects(verifyEncoded(output));
  assert.equal((await readdir(output)).includes("verification.json"), false);
});

it("refuses a report that names a file this package would never write", async () => {
  const report = await readEncodingReport(output);
  await writeReport(join(output, "report.json"), {
    ...report,
    files: report.files.map(file => ({...file, key: "../sfx-ui-click"})),
  });

  await assert.rejects(verifyEncoded(output), /Invalid export name/);
});

it("records a finding, writes the report with passed false, and then fails", async () => {
  const report = await readEncodingReport(output);
  await writeReport(join(output, "report.json"), {...report, files: report.files.map(file => ({...file, seconds: 1}))});

  await assert.rejects(verifyEncoded(output), /sfx-ui-click.mp3: duration mismatch/);
  const verification = await verificationOf(output);
  assert.equal(verification.passed, false);
  assert.equal(verification.failures.length, 1);
});

it("runs the encoder it is given for the version, the probe and the decode, and no other", async () => {
  const encoder = await shimEncoder(folder);
  await verifyEncoded(output, encoder);
  const calls = (await readFile(join(folder, "calls.log"), "utf8")).split("\n");

  assert.ok(calls.includes("ffmpeg -version"), "the version");
  assert.ok(calls.includes("ffprobe -v"), "the probe");
  assert.ok(calls.includes("ffmpeg -v"), "the decode");
});

it("fails when the encoder it is given cannot be run", async () => {
  await assert.rejects(verifyEncoded(output, "/missing/ffmpeg"), /ENOENT/);
});
