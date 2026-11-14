import {extname} from "node:path";

const MIME_TYPES: Readonly<Record<string, string>> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json",
  ".mp3": "audio/mpeg",
  ".ogg": "audio/ogg",
};

/** The type a browser is told a file is, which for a script is what lets it run, and for audio is a hint to decode it. */
export function mimeType(fileName: string): string {
  return MIME_TYPES[extname(fileName)] ?? "application/octet-stream";
}
