import {writeFile} from "node:fs/promises";
import {format, resolveConfig} from "prettier";

/**
 * Writes a report as JSON, formatted by the package's own Prettier config, so a report the tools write passes `format:check`
 * and never needs a hand-run `prettier --write`. It is indented first, because Prettier keeps an object open that was
 * written open and folds short arrays, and ends the file with a newline, which is how the reports have always looked.
 */
export async function writeReport(path: string, report: unknown): Promise<void> {
  const options = await resolveConfig(path);
  await writeFile(path, await format(JSON.stringify(report, undefined, 2), {...options, filepath: path}));
}
