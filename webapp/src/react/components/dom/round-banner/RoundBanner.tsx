import {worldOfPage} from "@src/game/scenario/WorldOfPage";
import {roundMessage} from "@src/react/components/dom/round-banner/message/RoundMessage";
import {selectRound} from "@src/store/game/selectors/select-round/SelectRound";
import {useGameStore} from "@src/store/game/UseGameStore";
import type {JSX} from "react";

/**
 * The first overlay: once the round is won or lost, what happened and a button to play again, over the middle of the
 * arena. It shows nothing while the round is being fought. It re-renders only when the round ends or restarts, though the
 * world behind it is replaced every frame. "Play again" puts a fresh match in the game store.
 */
export function RoundBanner(): JSX.Element | undefined {
  const round = useGameStore(selectRound);
  if (round === "playing") {
    return undefined;
  }

  return (
    <div
      role="status"
      data-testid="round-banner"
      className="fixed inset-0 flex flex-col items-center justify-center gap-6 bg-gs-background/60"
    >
      <h1 className="text-5xl font-bold tracking-wide text-gs-ui-text">{roundMessage(round)}</h1>

      <button
        type="button"
        className="rounded-md bg-gs-team-blue px-6 py-3 text-lg font-semibold text-gs-background"
        onClick={() => {
          useGameStore.getState().setWorld(worldOfPage());
        }}
      >
        Play again
      </button>
    </div>
  );
}
