import type {World} from "@gunsmith/engine/game-loop/types/World";
import {nextRound} from "@gunsmith/engine/match/NextRound";
import type {Match} from "@gunsmith/engine/match/types/Match";
import {seedOfPage} from "@src/game/scenario/seed/SeedOfPage";
import {worldOfScenario} from "@src/game/scenario/WorldOfScenario";

/**
 * The next round of a match that is going on: the duel set up afresh (both fighters at full health and full magazines,
 * back where they began) with the score kept and the round number up by one. Only the duel is a match. The opponent's seed
 * is the page's moved on by the rounds already played, so a page asked for `?seed=` replays the whole match exactly, and
 * each round is still a different fight.
 */
export function nextRoundOfPage(match: Match): World {
  const next = nextRound(match);

  return {...worldOfScenario("duel", seedOfPage() + next.roundNumber - 1), match: next};
}
