import {scenarioOfPage} from "@src/game/scenario/ScenarioOfPage";
import {RoomEntry} from "@src/react/components/dom/front-door/components/room-entry/RoomEntry";
import {useAppStore} from "@src/store/app/UseAppStore";
import type {JSX} from "react";

/** From the practice range, enter a match against the bot, make or join a private room, or open the sources in a separate tab. */
export function FrontDoor(): JSX.Element | undefined {
  const workshopOpen = useAppStore(state => state.workshopOpen);
  if (scenarioOfPage() !== "practice" || workshopOpen) {
    return undefined;
  }

  return (
    <nav aria-label="Practice range" className="pointer-events-none fixed top-3 left-3 flex flex-col items-start gap-1">
      <button
        type="button"
        className="pointer-events-auto rounded-md bg-gs-ui-surface px-3 py-2 text-sm font-semibold text-gs-ui-text"
        onMouseDown={event => {
          event.stopPropagation();
        }}
        onClick={() => {
          location.assign("/?scenario=duel&preRound=1");
        }}
      >
        Fight the bot
      </button>

      <RoomEntry />

      <a
        href="/references.html"
        target="_blank"
        rel="noopener"
        className="pointer-events-auto rounded-md bg-gs-ui-surface px-3 py-2 text-xs text-gs-ui-text underline underline-offset-4 hover:text-gs-team-blue"
        onMouseDown={event => {
          event.stopPropagation();
        }}
      >
        References &amp; credits
      </a>
    </nav>
  );
}
