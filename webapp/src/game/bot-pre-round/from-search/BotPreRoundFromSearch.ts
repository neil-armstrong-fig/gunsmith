import {scenarioFromSearch} from "@src/game/scenario/ScenarioFromSearch";

/** Whether the page's query asks for the duel to wait behind its pre-round (`?scenario=duel&preRound=1`). The pre-round is the duel's alone: any other scenario, and a duel without the ask, starts at once. */
export function botPreRoundFromSearch(search: string): boolean {
  return scenarioFromSearch(search) === "duel" && new URLSearchParams(search).get("preRound") === "1";
}
