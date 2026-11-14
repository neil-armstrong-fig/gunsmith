import type {MouseClick} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-game-loop/hooks/use-firing/trigger/types/MouseClick";

/**
 * Whether a mouse button going down pulls the trigger: the left button, on anything but a button. A click on one of the
 * overlay's buttons ("Next round", "Play again") is for that button; without this it would also fire a shot into the round
 * it starts.
 */
export function pullsTheTrigger(click: MouseClick): boolean {
  if (click.button !== 0) {
    return false;
  }

  if (!click.target) {
    return true;
  }

  // `closest` answers null when nothing matches, as the DOM does.
  return click.target.closest("button") === null;
}
