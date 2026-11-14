import type {ExportFormat} from "@gunsmith/audio-studies/encoding/format/ExportFormat";

/** The file an export is written to: its master's key and its format, as `sfx-hit.ogg`. */
export function exportName(key: string, format: ExportFormat): string {
  return `${key}.${format}`;
}
