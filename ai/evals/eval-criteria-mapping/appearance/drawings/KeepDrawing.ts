import {mkdirSync, readFileSync, writeFileSync} from "node:fs";
import {drawingsSheetHtml} from "@evals/eval-criteria-mapping/appearance/drawings/sheet/DrawingsSheetHtml";
import type {KeepDrawingOptions} from "@evals/eval-criteria-mapping/appearance/drawings/types/KeepDrawingOptions";
import type {KeptDrawing} from "@evals/eval-criteria-mapping/appearance/drawings/types/KeptDrawing";

/**
 * Adds one drawing to `drawings-<tier>-latest.json` and rewrites the page beside it, when the run asked to keep drawings
 * (`EVAL_KEEP_DRAWINGS=1`), so the person judging whether they look right has something to open. Does nothing otherwise.
 * `startDrawings` empties the file when a run begins.
 */
export function keepDrawing(options: KeepDrawingOptions): void {
  if (!options.enabled) {
    return;
  }

  mkdirSync(options.folder, {recursive: true});
  const base = `${options.folder}/drawings-${options.tier}-latest`;
  const drawings = [...readKept(`${base}.json`), options.drawing];
  writeFileSync(`${base}.json`, `${JSON.stringify(drawings, undefined, 2)}\n`);
  writeFileSync(`${base}.html`, drawingsSheetHtml(drawings));
}

function readKept(file: string): KeptDrawing[] {
  try {
    return JSON.parse(readFileSync(file, "utf8")) as KeptDrawing[];
  } catch {
    return [];
  }
}
