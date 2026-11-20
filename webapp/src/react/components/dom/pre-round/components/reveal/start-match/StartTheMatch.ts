import {worldWithPicks} from "@src/game/pre-round/WorldWithPicks";
import type {PreRoundPicks} from "@src/game/pre-round/types/PreRoundPicks";
import type {OfferedArena} from "@src/game/pre-round/types/OfferedArena";
import {duelWorldOn} from "@src/game/scenario/duel-on-arena/DuelWorldOn";
import {ringTimingOfPage} from "@src/game/scenario/ring-timing/RingTimingOfPage";
import {seedOfPage} from "@src/game/scenario/seed/SeedOfPage";
import {useGameStore} from "@src/store/game/UseGameStore";
import {usePreRoundStore} from "@src/store/pre-round/UsePreRoundStore";

/**
 * What "Start the match" does: round 1 is the duel on the arena the player chose, the player carries the weapons they locked in, and that world is
 * written to the game store before the pre-round ends so the loop never steps the old arena or loadout.
 */
export function startTheMatch(picks: PreRoundPicks, arena: OfferedArena): void {
  const world = duelWorldOn(arena.arena, seedOfPage(), ringTimingOfPage());

  useGameStore.getState().setWorld(worldWithPicks(world, picks));
  usePreRoundStore.getState().startMatch();
}
