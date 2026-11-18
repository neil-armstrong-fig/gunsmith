import {mkdirSync, writeFileSync} from "node:fs";
import type {KeepDrawingOptions} from "@evals/eval-criteria-mapping/setups/appearance/shared/drawings/types/KeepDrawingOptions";

/** What a run needs to start with a clean page: where, which tier, and whether it keeps drawings at all. */
type StartDrawingsOptions = Pick<KeepDrawingOptions, "folder" | "tier" | "enabled">;

/** Empties the kept drawings when a run that keeps them begins, so the page shows this run and not every run since. */
export function startDrawings(options: StartDrawingsOptions): void {
  if (!options.enabled) {
    return;
  }

  mkdirSync(options.folder, {recursive: true});
  writeFileSync(`${options.folder}/drawings-${options.tier}-latest.json`, "[]\n");
}
