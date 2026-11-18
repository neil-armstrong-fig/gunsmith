import {mkdirSync, readFileSync, writeFileSync} from "node:fs";
import type {StartArenasOptions} from "@evals/eval-criteria-mapping/setups/arena/shared/arenas/types/StartArenasOptions";

/**
 * Empties the kept arenas when a run that keeps them begins, so the page shows this run and not every run since. Each spec file is a
 * process of its own and the arenas of several spec files share one page, so the run's id is left in a mark beside the file: a spec
 * file of the same run finds its mark and leaves what the others kept. A run with no id cannot be told from an earlier one, so it clears.
 */
export function startArenas(options: StartArenasOptions): void {
  if (!options.enabled) {
    return;
  }

  mkdirSync(options.folder, {recursive: true});
  const base = `${options.folder}/arenas-${options.tier}-latest`;
  if (options.runId !== undefined && markOf(`${base}.run`) === options.runId) {
    return;
  }

  writeFileSync(`${base}.json`, "[]\n");
  writeFileSync(`${base}.run`, `${options.runId ?? ""}\n`);
}

function markOf(file: string): string | undefined {
  try {
    return readFileSync(file, "utf8").trim();
  } catch {
    return undefined;
  }
}
