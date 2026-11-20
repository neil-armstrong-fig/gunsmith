import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import type {World} from "@gunsmith/engine/game-loop/types/World";
import {nextRound} from "@gunsmith/engine/match/NextRound";
import type {Match} from "@gunsmith/engine/match/types/Match";
import type {PreRoundPicks} from "@src/game/pre-round/types/PreRoundPicks";
import {worldWithPicks} from "@src/game/pre-round/WorldWithPicks";
import {duelWorldOn} from "@src/game/scenario/duel-on-arena/DuelWorldOn";
import {ringTimingOfPage} from "@src/game/scenario/ring-timing/RingTimingOfPage";
import {seedOfPage} from "@src/game/scenario/seed/SeedOfPage";
import {worldOfScenario} from "@src/game/scenario/WorldOfScenario";

/**
 * The next round of a match that is going on: the duel set up afresh (both fighters at full health and full magazines,
 * back where they began) with the score kept and the round number up by one. Only the duel is a match. The opponent's seed
 * is the page's moved on by the rounds already played, so a page asked for `?seed=` replays the whole match exactly, and
 * each round is still a different fight, and closes its ring on a new point. The ring timing the page asked for carries into every round.
 * A player who locked in weapons at the pre-round (`picks`) carries them into every round, and the arena the pre-round settled on (`arena`)
 * is the arena of every round; without one the round is the duel's own arena.
 */
export function nextRoundOfPage(match: Match, picks?: PreRoundPicks, arena?: Arena): World {
  const next = nextRound(match);
  const world = {...duelRoundOf(next, arena), match: next};
  if (!picks) {
    return world;
  }

  return worldWithPicks(world, picks);
}

function duelRoundOf(match: Match, arena: Arena | undefined): World {
  const seed = seedOfPage() + match.roundNumber - 1;
  if (!arena) {
    return worldOfScenario("duel", seed, ringTimingOfPage());
  }

  return duelWorldOn(arena, seed, ringTimingOfPage());
}
