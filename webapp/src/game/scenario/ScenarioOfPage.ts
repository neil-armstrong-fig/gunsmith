import {scenarioFromSearch} from "@src/game/scenario/ScenarioFromSearch";
import type {Scenario} from "@src/game/scenario/types/Scenario";

/** The scenario the page was opened for. Outside a browser (a unit test) there is no query to read, so it is the practice range. */
export function scenarioOfPage(): Scenario {
  if (typeof location === "undefined") {
    return "practice";
  }

  return scenarioFromSearch(location.search);
}
