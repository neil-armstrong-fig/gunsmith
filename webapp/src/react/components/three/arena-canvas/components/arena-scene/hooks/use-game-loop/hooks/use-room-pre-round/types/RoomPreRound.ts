import type {AfterFrameRequest} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-game-loop/hooks/use-room-pre-round/types/AfterFrameRequest";

/** What the loop is given to keep the room's pre-round in step with the server: it is told after every frame of a room page. */
export interface RoomPreRound {
  /** Copies what the server said of the pre-round into the store, and sends what the player locked in for as long as the server does not hold it. */
  afterFrame: (request: AfterFrameRequest) => void;
}
