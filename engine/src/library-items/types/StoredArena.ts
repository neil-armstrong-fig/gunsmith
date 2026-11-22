import type {Arena} from "@gunsmith/engine/arena/types/Arena";

/** An arena read back from the library: its name, the drawing it was kept as, and the arena the engine reads that drawing as. */
export interface StoredArena {
  name: string;
  rows: readonly string[];
  arena: Arena;
}
