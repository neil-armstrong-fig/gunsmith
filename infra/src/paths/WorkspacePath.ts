import {resolve} from "node:path";

export function workspacePath(...segments: string[]): string {
  return resolve(import.meta.dirname, "../../..", ...segments);
}
