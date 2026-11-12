import type {Scenario} from "@src/game/scenario/types/Scenario";

/**
 * The scenario a page's query string asks for (`?scenario=duel` or `?scenario=sparring`). Anything else, or nothing, is the practice range:
 * the query only picks between matches, it never carries state into one.
 */
export function scenarioFromSearch(search: string): Scenario {
  const asked = new URLSearchParams(search).get("scenario");
  if (asked === "duel") {
    return "duel";
  }

  if (asked === "sparring") {
    return "sparring";
  }

  return "practice";
}
