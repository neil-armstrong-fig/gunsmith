import type {Scenario} from "@src/game/scenario/types/Scenario";

/**
 * The scenario a page's query string asks for (`?room=<code>` for an online room, which wins over any other; `?scenario=duel`, `sparring`, `heights`, `terraced`, `overlook` or `pickup-race`). Anything else, or nothing, is the practice range.
 * The query picks between matches and can tune one's setup, never its state: `?seed=` (`seed/`) replays a match from the same draws,
 * and `?ringDelay=` and `?ringClosing=` (`ring-timing/`) set when its ring starts and how long it takes to close.
 */
export function scenarioFromSearch(search: string): Scenario {
  const parameters = new URLSearchParams(search);
  if (parameters.get("room")) {
    return "room";
  }

  const asked = parameters.get("scenario");
  if (asked === "duel") {
    return "duel";
  }

  if (asked === "sparring") {
    return "sparring";
  }

  if (asked === "heights") {
    return "heights";
  }

  if (asked === "terraced") {
    return "terraced";
  }

  if (asked === "overlook") {
    return "overlook";
  }

  if (asked === "pickup-race") {
    return "pickup-race";
  }

  return "practice";
}
