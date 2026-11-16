import {basename} from "node:path";
import {readFileSync} from "node:fs";
import {htmlScriptFailures} from "@gunsmith/shared/config/repository/artifacts/file/html/HtmlScriptFailures.ts";
import {standaloneScriptFailures} from "@gunsmith/shared/config/repository/artifacts/file/standalone/StandaloneScriptFailures.ts";

/** What is wrong with one artifact: the scripts in a page, or a standalone script. */
export function artifactFailures(file: string): string[] {
  const code = readFileSync(file, "utf8");
  if (file.endsWith(".html")) {
    return htmlScriptFailures(code);
  }

  return standaloneScriptFailures(code, basename(file));
}
