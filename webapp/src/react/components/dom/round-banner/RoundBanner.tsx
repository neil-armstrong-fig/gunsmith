import {decideMatch} from "@gunsmith/engine/match/DecideMatch";
import {returnToMainMenu} from "@src/react/components/dom/game-menu/returning/ReturnToMainMenu";
import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import {nextRoundOfPage} from "@src/game/scenario/NextRoundOfPage";
import {worldOfPage} from "@src/game/scenario/WorldOfPage";
import {goOn} from "@src/react/components/dom/round-banner/go-on/GoOn";
import {matchGoesOn} from "@src/react/components/dom/round-banner/match/MatchGoesOn";
import {roundMessage} from "@src/react/components/dom/round-banner/message/RoundMessage";
import {scoreText} from "@src/react/components/dom/score-text/ScoreText";
import {useAppStore} from "@src/store/app/UseAppStore";
import {selectMatch} from "@src/store/game/selectors/select-match/SelectMatch";
import {selectRound} from "@src/store/game/selectors/select-round/SelectRound";
import {useGameStore} from "@src/store/game/UseGameStore";
import {usePreRoundStore} from "@src/store/pre-round/UsePreRoundStore";
import type {JSX} from "react";

/**
 * The first overlay: once the round is won or lost, what happened and a button to go on, over the middle of the arena. It
 * shows nothing while the round is being fought. In a match it also shows the score, and offers the next round while the
 * match goes on; once the match is won or lost, or when there is no match, it offers "Play again", which puts a fresh match
 * in the game store. In an online room the buttons only ask the server to go on (`goOn`), and once this player has asked the
 * banner says it is waiting for the other. It re-renders only when the round ends or restarts, though the world behind it is replaced every frame.
 */
export function RoundBanner(): JSX.Element | undefined {
  const match = useGameStore(selectMatch);
  const round = useGameStore(selectRound);
  const waiting = useAppStore(state => state.waitingForOtherPlayer);
  if (round === "playing") {
    return undefined;
  }

  return (
    <div
      role="status"
      data-testid="round-banner"
      className="fixed inset-0 flex flex-col items-center justify-center gap-6 bg-gs-background/60"
    >
      <h1 className="text-5xl font-bold tracking-wide text-gs-ui-text">
        {roundMessage(round, match && decideMatch(match))}
      </h1>

      {match && (
        <p data-testid="round-banner-score" className="font-mono text-2xl text-gs-ui-text">
          {scoreText(match)}
        </p>
      )}

      {waiting && (
        <p data-testid="round-banner-waiting" className="text-lg text-gs-ui-text">
          Waiting for the other player
        </p>
      )}

      {!waiting && matchGoesOn(match) && (
        <button
          type="button"
          className="rounded-md bg-gs-team-blue px-6 py-3 text-lg font-semibold text-gs-background"
          onClick={() => {
            goOn(() => nextRoundOfPage(match, usePreRoundStore.getState().picks, arenaOfPreRound()));
          }}
        >
          Next round
        </button>
      )}

      {!waiting && !matchGoesOn(match) && (
        <button
          type="button"
          className="rounded-md bg-gs-team-blue px-6 py-3 text-lg font-semibold text-gs-background"
          onClick={() => {
            goOn(worldOfPage);
            usePreRoundStore.getState().restart();
          }}
        >
          Play again
        </button>
      )}

      <button
        type="button"
        className="rounded-md border border-gs-edge/50 px-4 py-2 text-sm font-semibold text-gs-ui-text hover:border-gs-team-blue focus-visible:outline-2 focus-visible:outline-gs-team-blue"
        onClick={returnToMainMenu}
      >
        Back to main menu
      </button>
    </div>
  );
}

function arenaOfPreRound(): Arena | undefined {
  return usePreRoundStore.getState().arena?.arena;
}
