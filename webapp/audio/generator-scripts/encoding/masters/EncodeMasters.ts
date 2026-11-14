import {isExportKey} from "@gunsmith/audio-studies/encoding/files/IsExportKey";
import {encodeMaster} from "@gunsmith/audio-studies/encoding/masters/master/EncodeMaster";
import {AUDITION_KEY} from "@gunsmith/audio-studies/output/mix/AuditionKey";
import type {MastersRequest} from "@gunsmith/audio-studies/encoding/masters/types/MastersRequest";
import type {EncodedFile} from "@gunsmith/audio-studies/encoding/types/EncodedFile";

/** Encodes every master that is measured, in the order they were rendered, except the audition mix, which is for listening. */
export async function encodeMasters(request: MastersRequest): Promise<EncodedFile[]> {
  const {binary, source, staging, measurements} = request;
  const files: EncodedFile[] = [];
  for (const [key, measurement] of Object.entries(measurements.files)) {
    if (key === AUDITION_KEY) {
      continue;
    }
    if (!isExportKey(key)) {
      throw new Error(`Invalid master key: ${key}`);
    }
    files.push(...(await encodeMaster({binary, source, staging, key, measurement})));
  }

  return files;
}
