import type {SpriteKey} from "@src/assets/sprites/types/SpriteKey";
import {spriteTextures} from "@src/react/components/three/arena-canvas/sprites/loaded/SpriteTextures";
import type {CanvasTexture} from "three";

/** A picture's texture once it has loaded, and nothing before, or if the file could not be loaded: the caller draws a placeholder. */
export function loadedSprite(key: SpriteKey): CanvasTexture | undefined {
  return spriteTextures.get(key);
}
