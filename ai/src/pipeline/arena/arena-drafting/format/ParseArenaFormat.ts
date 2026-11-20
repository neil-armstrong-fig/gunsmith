import {ARENA_FORMATS} from "@gunsmith/ai/pipeline/arena/arena-drafting/format/ArenaFormat";
import {DEFAULT_ARENA_FORMAT} from "@gunsmith/ai/pipeline/arena/arena-drafting/format/DefaultArenaFormat";
import type {ArenaFormat} from "@gunsmith/ai/pipeline/arena/arena-drafting/format/ArenaFormat";

/** The format a setting names, the default when it names none, and an error naming the formats when it names one that is not. */
export function parseArenaFormat(setting: string | undefined): ArenaFormat {
  if (setting === undefined) {
    return DEFAULT_ARENA_FORMAT;
  }

  const format = ARENA_FORMATS.find(candidate => candidate === setting);
  if (format === undefined) {
    throw new Error(`Unknown arena format '${setting}': use one of ${ARENA_FORMATS.join(", ")}.`);
  }

  return format;
}
