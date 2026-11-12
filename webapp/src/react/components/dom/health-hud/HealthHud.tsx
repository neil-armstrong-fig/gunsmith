import {PLAYER_HEALTH} from "@gunsmith/engine/health/PlayerHealth";
import {selectPlayerHealth} from "@src/store/game/selectors/select-player-health/SelectPlayerHealth";
import {useGameStore} from "@src/store/game/UseGameStore";
import type {JSX} from "react";

/**
 * The player's health, over the bottom right of the arena: the number, and a bar that shrinks as it falls. It re-renders
 * only when a hit lands, though the world behind it is replaced every frame.
 */
export function HealthHud(): JSX.Element {
  const health = useGameStore(selectPlayerHealth);

  return (
    <div
      role="group"
      aria-label="Health"
      data-testid="health-hud"
      className="pointer-events-none fixed right-4 bottom-4 flex flex-col gap-2 rounded-md bg-gs-ui-surface/80 px-4 py-3 shadow-lg"
    >
      <div className="flex items-baseline justify-between gap-6">
        <span className="text-xs tracking-wide text-gs-ui-muted uppercase">Health</span>

        <span data-testid="player-health" className="font-mono text-2xl text-gs-ui-text tabular-nums">
          {health}
        </span>
      </div>

      <div className="h-2 w-40 rounded-sm bg-gs-ui-muted/30">
        <div
          data-testid="health-bar"
          className="h-full rounded-sm bg-gs-success"
          style={{width: `${(health / PLAYER_HEALTH) * 100}%`}}
        />
      </div>
    </div>
  );
}
