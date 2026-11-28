import {worldWithPicks} from "@src/game/bot-pre-round/WorldWithPicks";
import type {BotPreRoundPicks} from "@src/game/bot-pre-round/types/BotPreRoundPicks";
import type {OfferedArena} from "@src/game/pre-round/types/OfferedArena";
import {duelWorldOn} from "@src/game/scenario/round/DuelWorldOn";
import {ringTimingOfPage} from "@src/game/scenario/ring-timing/RingTimingOfPage";
import {seedOfPage} from "@src/game/scenario/seed/SeedOfPage";
import {useGameStore} from "@src/store/game/UseGameStore";
import {useBotPreRoundStore} from "@src/store/bot-pre-round/UseBotPreRoundStore";

/**
 * What "Start the match" does: round 1 is the duel on the arena the player chose, the player carries the weapons they locked in, and that world is
 * written to the game store before the pre-round ends so the loop never steps the old arena or loadout.
 */
export function startTheMatch(picks: BotPreRoundPicks, arena: OfferedArena): void {
  const world = duelWorldOn(arena.arena, seedOfPage(), ringTimingOfPage());

  useGameStore.getState().setWorld(worldWithPicks(world, picks));
  useBotPreRoundStore.getState().startMatch();
}
