import {useSyncExternalStore} from "react";
import type {CanvasTexture} from "three";
import type {SpriteKey} from "@src/assets/sprites/types/SpriteKey";
import {loadedSprite} from "@src/react/components/three/arena-canvas/sprites/LoadSprites";
import {subscribeToSprites} from "@src/react/components/three/arena-canvas/sprites/SpritesReadiness";

/** The texture of one of the game's pictures once it has loaded (`useSpritesReady` starts the loading), and `undefined` until then or if it could not be: draw a placeholder. */
export function useSprite(key: SpriteKey): CanvasTexture | undefined {
  return useSyncExternalStore(subscribeToSprites, () => loadedSprite(key));
}
