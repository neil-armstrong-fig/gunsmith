import type {DueAction} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-game-loop/hooks/use-room-pre-round/sends-due/types/DueAction";

/** What to send now of what the player locked in, and how long ago it was last sent once that is done. */
export interface SendsDue {
  actions: readonly DueAction[];
  /** The real seconds since the last send, to be handed back with the next frame. */
  secondsSinceSend: number;
}
