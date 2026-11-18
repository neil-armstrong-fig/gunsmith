import {mkdirSync, readFileSync, writeFileSync} from "node:fs";
import {archiveEvalResult} from "@evals/eval-criteria-mapping/environment/archive/ArchiveEvalResult";
import {arenasSheetHtml} from "@evals/eval-criteria-mapping/setups/arena/shared/arenas/sheet/ArenasSheetHtml";
import type {KeepArenaOptions} from "@evals/eval-criteria-mapping/setups/arena/shared/arenas/types/KeepArenaOptions";
import type {KeptArena} from "@evals/eval-criteria-mapping/setups/arena/shared/arenas/types/KeptArena";

/**
 * Adds one arena to `arenas-<tier>-latest.json` and rewrites the page beside it, when the run keeps arenas, so the person judging
 * whether they look right has something to open. Does nothing otherwise. `startArenas` empties the file when a run begins. The page
 * is also kept for good in the main checkout's `private-source/eval-results/` (see `archiveEvalResult`).
 */
export function keepArena(options: KeepArenaOptions): void {
  if (!options.enabled) {
    return;
  }

  mkdirSync(options.folder, {recursive: true});
  const base = `${options.folder}/arenas-${options.tier}-latest`;
  const arenas = [...readKept(`${base}.json`), options.arena];
  const json = `${JSON.stringify(arenas, undefined, 2)}\n`;
  const sheet = arenasSheetHtml(arenas);

  writeFileSync(`${base}.json`, json);
  writeFileSync(`${base}.html`, sheet);
  archiveEvalResult(`arenas-${options.tier}.json`, json);
  archiveEvalResult(`arenas-${options.tier}.html`, sheet);
}

function readKept(file: string): KeptArena[] {
  try {
    return JSON.parse(readFileSync(file, "utf8")) as KeptArena[];
  } catch {
    return [];
  }
}
