import {countdownText} from "@src/react/components/dom/ring-hud/text/CountdownText";
import {selectSecondsUntilRing} from "@src/store/game/selectors/select-seconds-until-ring/SelectSecondsUntilRing";
import {useGameStore} from "@src/store/game/UseGameStore";
import type {JSX} from "react";

/**
 * The time left before the ring starts to close, under the score. It shows nothing when the game has no ring. It
 * re-renders once a second, though the world behind it is replaced every frame.
 */
export function RingHud(): JSX.Element | undefined {
  const secondsUntilStart = useGameStore(selectSecondsUntilRing);
  if (secondsUntilStart === undefined) {
    return undefined;
  }

  return (
    <div
      role="group"
      aria-label="Ring"
      className="pointer-events-none fixed top-16 left-1/2 -translate-x-1/2 rounded-md bg-gs-ui-surface/80 px-4 py-1 shadow-lg"
    >
      <span data-testid="ring-countdown" className="font-mono text-sm text-gs-ui-text">
        {countdownText(secondsUntilStart)}
      </span>
    </div>
  );
}
