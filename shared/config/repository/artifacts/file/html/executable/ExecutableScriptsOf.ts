import {scriptModeOf} from "@gunsmith/shared/config/repository/artifacts/file/html/executable/mode/ScriptModeOf.ts";
import type {ExecutableScript} from "@gunsmith/shared/config/repository/artifacts/file/html/executable/types/ExecutableScript.ts";

/** Script elements are raw text; quoted tag attributes and HTML comments are handled separately. */
export function executableScriptsOf(html: string): ExecutableScript[] {
  const scripts: ExecutableScript[] = [];
  const elements = /<!--[\s\S]*?-->|<script\b((?:"[^"]*"|'[^']*'|[^'">])*)>([\s\S]*?)<\/script\s*>/gi;
  for (const match of html.matchAll(elements)) {
    const attributes = match[1];
    const code = match[2];
    if (attributes === undefined || code === undefined) {
      continue;
    }

    const scriptMode = scriptModeOf(attributes);
    if (!scriptMode) {
      continue;
    }

    scripts.push({code, scriptMode});
  }
  return scripts;
}
