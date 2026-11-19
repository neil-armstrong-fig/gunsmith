import {ARENA_FORMATS} from "@gunsmith/ai/pipeline/arena/arena-drafting/format/ArenaFormat";
import type {ArenaFormat} from "@gunsmith/ai/pipeline/arena/arena-drafting/format/ArenaFormat";

/** The format a setting names, `rows` when it names none, and an error naming the formats when it names one that is not. */
export function parseArenaFormat(setting: string | undefined): ArenaFormat {
  if (setting === undefined) {
    return "rows";
  }

  const format = ARENA_FORMATS.find(candidate => candidate === setting);
  if (format === undefined) {
    throw new Error(`Unknown arena format '${setting}': use one of ${ARENA_FORMATS.join(", ")}.`);
  }

  return format;
}
