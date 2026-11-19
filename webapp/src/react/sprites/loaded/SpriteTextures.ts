import type {SpriteKey} from "@src/assets/sprites/types/SpriteKey";
import type {CanvasTexture} from "three";

/** The textures of the pictures that have loaded, by key: `loadSprites` fills it, `loadedSprite` reads it. */
export const spriteTextures = new Map<SpriteKey, CanvasTexture>();
