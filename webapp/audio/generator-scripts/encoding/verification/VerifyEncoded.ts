import {readFile, rm} from "node:fs/promises";
import {join, resolve} from "node:path";
import {pathToFileURL} from "node:url";
import {exportName} from "@gunsmith/audio-studies/encoding/files/ExportName";
import {isExportName} from "@gunsmith/audio-studies/encoding/files/IsExportName";
import {sha256Of} from "@gunsmith/audio-studies/encoding/hash/Sha256Of";
import {measurePcm} from "@gunsmith/audio-studies/encoding/pcm/MeasurePcm";
import {encoderBinary} from "@gunsmith/audio-studies/encoding/process/binary/EncoderBinary";
import {probeBinary} from "@gunsmith/audio-studies/encoding/process/binary/ProbeBinary";
import {encoderVersion} from "@gunsmith/audio-studies/encoding/process/version/EncoderVersion";
import {readEncodingReport} from "@gunsmith/audio-studies/encoding/report/ReadEncodingReport";
import {REPORT_FILES} from "@gunsmith/audio-studies/encoding/report/ReportFiles";
import {writeReport} from "@gunsmith/audio-studies/encoding/report/WriteReport";
import {decodePcm} from "@gunsmith/audio-studies/encoding/verification/decode/DecodePcm";
import {crouchFailures} from "@gunsmith/audio-studies/encoding/verification/failures/CrouchFailures";
import {durationFailure} from "@gunsmith/audio-studies/encoding/verification/failures/DurationFailure";
import {loopFailure} from "@gunsmith/audio-studies/encoding/verification/failures/LoopFailure";
import {expectedProbe} from "@gunsmith/audio-studies/encoding/verification/probe/ExpectedProbe";
import {probeExport} from "@gunsmith/audio-studies/encoding/verification/probe/ProbeExport";
import type {PcmMeasurement} from "@gunsmith/audio-studies/encoding/pcm/types/PcmMeasurement";
import type {VerificationReport} from "@gunsmith/audio-studies/encoding/verification/types/VerificationReport";

/**
 * Decodes every export in `output` with the same build that encoded it and writes what it found to `verification.json`. An
 * export that is not the one reported (a bad name, hash or codec) stops the check, with no report written. A finding (a length,
 * a loop's join, a footfall's level) is recorded, the report is written, and then the check fails, so a red result is never
 * left looking green.
 */
export async function verifyEncoded(output: string, encoder = encoderBinary()): Promise<void> {
  await rm(join(output, REPORT_FILES.verification), {force: true});
  const report = await readEncodingReport(output);
  const files: Record<string, PcmMeasurement> = {};
  const failures: string[] = [];
  for (const file of report.files) {
    if (!isExportName(file.key, file.format)) {
      throw new Error("Invalid export name");
    }
    const name = exportName(file.key, file.format);
    const input = join(output, name);
    if (sha256Of(await readFile(input)) !== file.sha256) {
      throw new Error(`${name}: hash mismatch`);
    }
    const probe = await probeExport(probeBinary(encoder), input);
    if (probe !== expectedProbe(file)) {
      throw new Error(`${name}: codec or channel mismatch (${probe})`);
    }
    const measurement = measurePcm(await decodePcm(encoder, input), file.channels);
    failures.push(
      ...[
        durationFailure({name, frames: measurement.frames, seconds: file.seconds}),
        loopFailure({key: file.key, name, loopJump: measurement.loopJump}),
      ].filter(failure => failure !== undefined),
    );
    files[name] = measurement;
  }
  failures.push(...crouchFailures(files));
  const verification: VerificationReport = {
    decoder: await encoderVersion(encoder),
    files,
    passed: failures.length === 0,
    failures,
  };
  await writeReport(join(output, REPORT_FILES.verification), verification);
  if (failures.length > 0) {
    throw new Error(failures.join("\n"));
  }
}

// Node's native TypeScript support runs this entry point without a transpiler.
const entry = process.argv[1];
if (entry && pathToFileURL(resolve(entry)).href === import.meta.url) {
  await verifyEncoded(resolve(import.meta.dirname, "../../encoded-audio"));
}
