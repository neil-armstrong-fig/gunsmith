import {scenarioOfPage} from "@src/game/scenario/ScenarioOfPage";
import {useAppStore} from "@src/store/app/UseAppStore";
import type {JSX} from "react";

/** The way from the practice range into a match: "Fight the bot" opens the duel behind its pre-round. A small button in a corner, gone while the workshop is up, and a press on it never fires a shot. */
export function FrontDoor(): JSX.Element | undefined {
  const workshopOpen = useAppStore(state => state.workshopOpen);
  if (scenarioOfPage() !== "practice" || workshopOpen) {
    return undefined;
  }

  return (
    <button
      type="button"
      className="fixed top-3 left-3 rounded-md bg-gs-ui-surface px-3 py-2 text-sm font-semibold text-gs-ui-text"
      onMouseDown={event => {
        event.stopPropagation();
      }}
      onClick={() => {
        location.assign("/?scenario=duel&preRound=1");
      }}
    >
      Fight the bot
    </button>
  );
}
