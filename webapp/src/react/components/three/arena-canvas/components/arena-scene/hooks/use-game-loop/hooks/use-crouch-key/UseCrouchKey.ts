import {useHeldKeys} from "@src/react/hooks/use-held-keys/UseHeldKeys";
import {crouchHeld} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-game-loop/hooks/use-crouch-key/keys/CrouchHeld";
import type {RefObject} from "react";

/** Whether a crouch key is held right now, kept in a ref for the arena to read every frame. Crouching lasts as long as the key does. */
export function useCrouchKey(): RefObject<boolean> {
  return useHeldKeys(crouchHeld);
}
