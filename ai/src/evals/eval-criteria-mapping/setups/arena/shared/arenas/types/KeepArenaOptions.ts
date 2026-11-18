import type {ArenaKeeping} from "@evals/eval-criteria-mapping/setups/arena/shared/arenas/types/ArenaKeeping";
import type {KeptArena} from "@evals/eval-criteria-mapping/setups/arena/shared/arenas/types/KeptArena";

/** What `keepArena` needs: where and whether to keep, and the arena to add. */
export interface KeepArenaOptions extends ArenaKeeping {
  arena: KeptArena;
}
