import type {Scenario} from "@src/game/scenario/types/Scenario";

/**
 * The scenario a page's query string asks for (`?scenario=duel`, `sparring` or `heights`). Anything else, or nothing, is the practice range.
 * The query picks between matches and can tune one's setup, never its state: `?seed=` (`seed/`) replays a match from the same draws,
 * and `?ringDelay=` and `?ringClosing=` (`ring-timing/`) set when its ring starts and how long it takes to close.
 */
export function scenarioFromSearch(search: string): Scenario {
  const asked = new URLSearchParams(search).get("scenario");
  if (asked === "duel") {
    return "duel";
  }

  if (asked === "sparring") {
    return "sparring";
  }

  if (asked === "heights") {
    return "heights";
  }

  return "practice";
}
