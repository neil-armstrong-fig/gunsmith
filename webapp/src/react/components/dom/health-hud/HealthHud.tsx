import {PLAYER_HEALTH} from "@gunsmith/engine/health/PlayerHealth";
import {selectPlayerHealth} from "@src/store/game/selectors/select-player-health/SelectPlayerHealth";
import {HealthTrail} from "@src/react/components/dom/health-hud/components/health-trail/HealthTrail";
import {useFeedbackStore} from "@src/store/feedback/UseFeedbackStore";
import {useGameStore} from "@src/store/game/UseGameStore";
import type {JSX} from "react";

/**
 * The player's health, over the bottom right of the arena: the number, and a bar that shrinks as it falls, with the lost
 * part a burst of bullets took trailing behind it in amber, and a red border round the whole panel for as long as the ring is hurting
 * the player. What a hit or the ring does round the player is drawn in the arena (`DamageBrackets`, `RingHighlight`). It re-renders only
 * when a hit lands or the ring starts or stops hurting, though the world behind it is replaced every frame.
 */
export function HealthHud(): JSX.Element {
  const health = useGameStore(selectPlayerHealth);
  const bulletHits = useFeedbackStore(state => state.bulletHits);
  const ringHurting = useFeedbackStore(state => state.ringHurting);

  return (
    <div
      role="group"
      aria-label="Health"
      data-testid="health-hud"
      className={`pointer-events-none fixed right-4 bottom-4 flex flex-col gap-2 rounded-md bg-gs-ui-surface/80 px-4 py-3 shadow-lg ${borderOf(ringHurting)}`}
    >
      <div className="flex items-baseline justify-between gap-6">
        <span className="text-xs tracking-wide text-gs-ui-muted uppercase">Health</span>

        <span data-testid="player-health" className="font-mono text-2xl text-gs-ui-text tabular-nums">
          {health}
        </span>
      </div>

      <div className="relative h-2 w-40 rounded-sm bg-gs-ui-muted/30">
        <HealthTrail health={health} bulletHits={bulletHits} />

        <div
          data-testid="health-bar"
          className="relative h-full rounded-sm bg-gs-success"
          style={{width: `${(health / PLAYER_HEALTH) * 100}%`}}
        />
      </div>
    </div>
  );
}

function borderOf(ringHurting: boolean): string {
  if (ringHurting) {
    return "outline-2 outline-gs-ring";
  }

  return "";
}
