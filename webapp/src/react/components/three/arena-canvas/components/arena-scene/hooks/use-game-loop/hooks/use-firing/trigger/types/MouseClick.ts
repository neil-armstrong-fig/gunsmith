import type {ClickTarget} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-game-loop/hooks/use-firing/trigger/types/ClickTarget";

/** A mouse button going down: which button (0 is the left), and what it went down on, when that is an element. */
export interface MouseClick {
  button: number;
  target: ClickTarget | undefined;
}
