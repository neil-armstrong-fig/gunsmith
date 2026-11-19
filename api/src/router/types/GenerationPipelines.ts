import type {ArenaSmith} from "@src/router/routes/arenas/types/ArenaSmith";
import type {WeaponSmith} from "@src/router/routes/weapons/types/WeaponSmith";

/** The pipelines the Worker has to run for a player's words. One it lacks makes its route answer `ai-unavailable`, taking nothing. */
export interface GenerationPipelines {
  weaponSmith?: WeaponSmith;
  arenaSmith?: ArenaSmith;
}
