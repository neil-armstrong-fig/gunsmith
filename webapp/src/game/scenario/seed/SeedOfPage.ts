import {seedFromSearch} from "@src/game/scenario/seed/SeedFromSearch";

/**
 * The seed for the match about to start. The query's `?seed=` when it has one, the same every time, so a spec or a bug
 * report replays a match exactly; otherwise a fresh random whole number, which is the only place the game asks for
 * `Math.random` (the engine has none), so every page load and every "Play again" is a new match.
 */
export function seedOfPage(): number {
  if (typeof location !== "undefined") {
    const asked = seedFromSearch(location.search);
    if (asked !== undefined) {
      return asked;
    }
  }

  return Math.floor(Math.random() * 2 ** 32);
}
