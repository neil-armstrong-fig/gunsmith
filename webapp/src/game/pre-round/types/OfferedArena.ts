import type {Arena} from "@gunsmith/engine/arena/types/Arena";

/** An arena put forward at the pre-round: the name a player knows it by and the arena itself. */
export interface OfferedArena {
  /** What tells two arenas apart: a built-in's name or a saved arena's id, so a saved arena named like a built-in is still its own. */
  id: string;
  name: string;
  arena: Arena;
}
