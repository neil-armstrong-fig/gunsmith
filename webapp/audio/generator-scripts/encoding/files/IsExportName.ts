import {EXPORT_FORMATS} from "@gunsmith/audio-studies/encoding/format/ExportFormat";
import {isExportKey} from "@gunsmith/audio-studies/encoding/files/IsExportKey";

/** Whether a key and a format, as a report names them, make an export this package writes. */
export function isExportName(key: string, format: string): boolean {
  if (!isExportKey(key)) {
    return false;
  }

  return EXPORT_FORMATS.some(exported => exported === format);
}
