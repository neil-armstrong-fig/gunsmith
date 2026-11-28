import type {World} from "@gunsmith/engine/game-loop/types/World";
import {scenarioOfPage} from "@src/game/scenario/ScenarioOfPage";
import {ringTimingOfPage} from "@src/game/scenario/ring-timing/RingTimingOfPage";
import {seedOfPage} from "@src/game/scenario/seed/SeedOfPage";
import {worldOfScenario} from "@src/game/scenario/round/world-of-scenario/WorldOfScenario";

/**
 * A fresh match for the scenario the page was opened for, with the page's seed (the one it asked for, or a new one) and the
 * ring timing it asked for, if any.
 */
export function worldOfPage(): World {
  return worldOfScenario(scenarioOfPage(), seedOfPage(), ringTimingOfPage());
}
