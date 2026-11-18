import type {ArenaKeeping} from "@evals/eval-criteria-mapping/setups/arena/shared/arenas/types/ArenaKeeping";

/** What `startArenas` needs: where and whether to keep, and which run this is, so a spec file of the same run does not clear another's arenas. */
export interface StartArenasOptions extends ArenaKeeping {
  runId?: string;
}
