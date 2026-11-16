import {useEffect, useSyncExternalStore} from "react";
import {loadSprites} from "@src/react/components/three/arena-canvas/sprites/LoadSprites";
import {areSpritesReady, subscribeToSprites} from "@src/react/components/three/arena-canvas/sprites/SpritesReadiness";

/** Starts loading the game's pictures, and says whether they have all loaded (or been given up on). False for the first render, since nothing has been asked for yet. */
export function useSpritesReady(): boolean {
  useEffect(() => {
    loadSprites();
  }, []);

  return useSyncExternalStore(subscribeToSprites, areSpritesReady);
}
