import {scenarioOfPage} from "@src/game/scenario/ScenarioOfPage";
import {worldOfPage} from "@src/game/scenario/WorldOfPage";
import type {MenuView} from "@src/store/app/types/MenuView";
import {useAppStore} from "@src/store/app/UseAppStore";
import {useFeedbackStore} from "@src/store/feedback/UseFeedbackStore";
import {useGameStore} from "@src/store/game/UseGameStore";
import {usePreRoundStore} from "@src/store/pre-round/UsePreRoundStore";
import {useArenaWorkshopStore} from "@src/store/workshop/arena/UseArenaWorkshopStore";

/** Applies a local URL to the current arena canvas. Reset the pre-round and world before exposing the destination to the player. */
export function loadLocalGameOfPage(menuView: MenuView | undefined): void {
  const world = worldOfPage();
  usePreRoundStore.getState().restart();
  useGameStore.getState().setWorld(world);
  useFeedbackStore.setState({ringHurting: false});
  useArenaWorkshopStore.getState().setPracticeWorld(undefined);

  useAppStore.setState({scenario: scenarioOfPage(), workshopOpen: false, menuView});
}
