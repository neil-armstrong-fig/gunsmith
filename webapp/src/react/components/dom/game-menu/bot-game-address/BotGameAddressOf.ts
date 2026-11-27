import {seedFromSearch} from "@src/game/scenario/seed/SeedFromSearch";

/** Where "Start bot game" goes: the duel behind its pre-round, keeping the page's `?seed=` when it has one, so a spec or a bug report replays the same duel. */
const BOT_GAME_ADDRESS = "/?scenario=duel&preRound=1";

/** The address of a bot game started from a page whose query is `search`. */
export function botGameAddressOf(search: string): string {
  const seed = seedFromSearch(search);
  if (seed === undefined) {
    return BOT_GAME_ADDRESS;
  }

  return `${BOT_GAME_ADDRESS}&seed=${seed}`;
}
