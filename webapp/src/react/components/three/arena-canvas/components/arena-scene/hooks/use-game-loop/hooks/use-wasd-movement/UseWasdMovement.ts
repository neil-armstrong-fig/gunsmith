import {useHeldKeys} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-game-loop/hooks/use-held-keys/UseHeldKeys";
import {directionFromKeys} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-game-loop/hooks/use-wasd-movement/keys/DirectionFromKeys";
import type {Direction} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-game-loop/hooks/use-wasd-movement/types/Direction";
import type {RefObject} from "react";

/** The heading the WASD keys currently ask for, kept in a ref for the arena to read every frame. */
export function useWasdMovement(): RefObject<Direction> {
  return useHeldKeys(directionFromKeys);
}
