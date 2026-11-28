import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";

/** Whether the engine can read the drawing as an arena at all (`arenaFrom` does not throw); it says nothing about whether it can be played. */
export function isReadable(rows: readonly string[]): boolean {
  try {
    arenaFrom(rows);

    return true;
  } catch {
    return false;
  }
}
