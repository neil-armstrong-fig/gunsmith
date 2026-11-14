import {readoutText} from "@src/react/components/dom/score-hud/text/ReadoutText";
import {selectMatch} from "@src/store/game/selectors/select-match/SelectMatch";
import {useGameStore} from "@src/store/game/UseGameStore";
import type {JSX} from "react";

/**
 * The round being fought and the score, over the top middle of the arena. It shows nothing when the game is not a match.
 * It re-renders only when a round is scored or begins, though the world behind it is replaced every frame.
 */
export function ScoreHud(): JSX.Element | undefined {
  const match = useGameStore(selectMatch);
  if (!match) {
    return undefined;
  }

  return (
    <div
      role="group"
      aria-label="Score"
      className="pointer-events-none fixed top-4 left-1/2 -translate-x-1/2 rounded-md bg-gs-ui-surface/80 px-4 py-2 shadow-lg"
    >
      <span data-testid="match-score" className="font-mono text-lg text-gs-ui-text">
        {readoutText(match)}
      </span>
    </div>
  );
}
