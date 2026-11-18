import {mkdirSync, readFileSync, writeFileSync} from "node:fs";
import {archiveEvalResult} from "@evals/eval-criteria-mapping/environment/archive/ArchiveEvalResult";
import {drawingsSheetHtml} from "@evals/eval-criteria-mapping/setups/appearance/shared/drawings/sheet/DrawingsSheetHtml";
import type {KeepDrawingOptions} from "@evals/eval-criteria-mapping/setups/appearance/shared/drawings/types/KeepDrawingOptions";
import type {KeptDrawing} from "@evals/eval-criteria-mapping/setups/appearance/shared/drawings/types/KeptDrawing";

/**
 * Adds one drawing to `drawings-<tier>-latest.json` and rewrites the page beside it, when the run asked to keep drawings
 * (`EVAL_KEEP_DRAWINGS=1`), so the person judging whether they look right has something to open. Does nothing otherwise.
 * `startDrawings` empties the file when a run begins. The contact sheet is also kept for good in the main checkout's
 * `private-source/eval-results/` (see `archiveEvalResult`): a sheet of dozens of SVG drawings is the kind of result too big for git.
 */
export function keepDrawing(options: KeepDrawingOptions): void {
  if (!options.enabled) {
    return;
  }

  mkdirSync(options.folder, {recursive: true});
  const base = `${options.folder}/drawings-${options.tier}-latest`;
  const drawings = [...readKept(`${base}.json`), options.drawing];
  const json = `${JSON.stringify(drawings, undefined, 2)}\n`;
  const sheet = drawingsSheetHtml(drawings);
  writeFileSync(`${base}.json`, json);
  writeFileSync(`${base}.html`, sheet);
  archiveEvalResult(`drawings-${options.tier}.json`, json);
  archiveEvalResult(`drawings-${options.tier}.html`, sheet);
}

function readKept(file: string): KeptDrawing[] {
  try {
    return JSON.parse(readFileSync(file, "utf8")) as KeptDrawing[];
  } catch {
    return [];
  }
}
