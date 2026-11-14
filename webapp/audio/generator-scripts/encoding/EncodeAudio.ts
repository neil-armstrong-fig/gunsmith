import {mkdir, mkdtemp, rm} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join, resolve} from "node:path";
import {pathToFileURL} from "node:url";
import {encodeMasters} from "@gunsmith/audio-studies/encoding/masters/EncodeMasters";
import {encoderBinary} from "@gunsmith/audio-studies/encoding/process/binary/EncoderBinary";
import {encoderVersion} from "@gunsmith/audio-studies/encoding/process/version/EncoderVersion";
import {publishEncoded} from "@gunsmith/audio-studies/encoding/publish/PublishEncoded";
import {removeReports} from "@gunsmith/audio-studies/encoding/report/RemoveReports";
import {ENCODER_SETTINGS} from "@gunsmith/audio-studies/encoding/settings/EncoderSettings";
import {readMeasurements} from "@gunsmith/audio-studies/output/measurements/read/ReadMeasurements";
import type {EncodingOptions} from "@gunsmith/audio-studies/encoding/types/EncodingOptions";

/**
 * Encodes the measured masters into `output`, as Ogg Vorbis and MP3. Old reports are removed first, the exports are made in a
 * staging folder, and nothing is published unless every one succeeded, with the report last (`publishEncoded`).
 */
export async function encodeAudio(options: EncodingOptions): Promise<void> {
  const {source, output} = options;
  const binary = options.ffmpeg ?? encoderBinary();
  await mkdir(output, {recursive: true});
  await removeReports(output);
  const encoder = await encoderVersion(binary);
  const measurements = await readMeasurements(source);
  const staging = await mkdtemp(join(tmpdir(), "gunsmith-encoding-"));
  try {
    const files = await encodeMasters({binary, source, staging, measurements});
    await publishEncoded({staging, output, report: {encoder, sampleRate: ENCODER_SETTINGS.sampleRate, files}});
  } finally {
    await rm(staging, {recursive: true, force: true});
  }
}

// Node's native TypeScript support runs this entry point without a transpiler.
const entry = process.argv[1];
if (entry && pathToFileURL(resolve(entry)).href === import.meta.url) {
  const root = resolve(import.meta.dirname, "../..");
  await encodeAudio({source: join(root, "generated-audio"), output: join(root, "encoded-audio")});
}
