import {readFile} from "node:fs/promises";
import {join} from "node:path";
import {encoderArguments} from "@gunsmith/audio-studies/encoding/encoder-arguments/EncoderArguments";
import {exportName} from "@gunsmith/audio-studies/encoding/files/ExportName";
import {EXPORT_FORMATS} from "@gunsmith/audio-studies/encoding/format/ExportFormat";
import {sha256Of} from "@gunsmith/audio-studies/encoding/hash/Sha256Of";
import {runEncoder} from "@gunsmith/audio-studies/encoding/process/RunEncoder";
import type {MasterRequest} from "@gunsmith/audio-studies/encoding/masters/master/types/MasterRequest";
import type {EncodedFile} from "@gunsmith/audio-studies/encoding/types/EncodedFile";

/**
 * Encodes one master into staging, in every export format. The master must be the one that was measured, and must still be
 * the same when the encoding is done: the approved masters are never changed, and an encode of a file that moved is not trusted.
 */
export async function encodeMaster(request: MasterRequest): Promise<EncodedFile[]> {
  const {binary, source, staging, key, measurement} = request;
  const input = join(source, `${key}.wav`);
  const master = await readFile(input);
  const sourceSha256 = sha256Of(master);
  if (sourceSha256 !== measurement.sha256) {
    throw new Error(`${key}: master hash mismatch`);
  }
  const files: EncodedFile[] = [];
  for (const format of EXPORT_FORMATS) {
    const name = exportName(key, format);
    const destination = join(staging, name);
    await runEncoder(binary, encoderArguments({input, destination, format}));
    const bytes = await readFile(destination);
    files.push({
      key,
      format,
      sourceSha256,
      sha256: sha256Of(bytes),
      bytes: bytes.length,
      channels: measurement.channels,
      seconds: measurement.seconds,
      arguments: encoderArguments({input: `${key}.wav`, destination: name, format}),
    });
  }
  if (!(await readFile(input)).equals(master)) {
    throw new Error(`${key}: master changed during encoding`);
  }

  return files;
}
