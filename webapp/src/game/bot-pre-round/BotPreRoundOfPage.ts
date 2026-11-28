import {botPreRoundFromSearch} from "@src/game/bot-pre-round/from-search/BotPreRoundFromSearch";

/** Whether the page was opened asking for the duel's pre-round, or not outside a browser, where there is no query to read. */
export function botPreRoundOfPage(): boolean {
  if (typeof location === "undefined") {
    return false;
  }

  return botPreRoundFromSearch(location.search);
}
