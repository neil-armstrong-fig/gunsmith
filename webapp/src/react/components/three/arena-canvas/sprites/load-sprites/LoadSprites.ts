import {CanvasTexture} from "three";
import {SPRITE_KEYS} from "@src/assets/sprites/SpriteKeys";
import {SPRITE_MANIFEST} from "@src/assets/sprites/SpriteManifest";
import {spriteUrl} from "@src/assets/sprites/SpriteUrl";
import type {SpriteKey} from "@src/assets/sprites/types/SpriteKey";
import {rasteriseSvg} from "@src/react/components/three/arena-canvas/sprites/load-sprites/raster/RasteriseSvg";
import {spriteTextures} from "@src/react/components/three/arena-canvas/sprites/loaded/SpriteTextures";
import {spritesReadiness} from "@src/react/components/three/arena-canvas/sprites/SpritesReadiness";

/** A picture is drawn this many times bigger than art's size, so it stays sharp when the arena is zoomed to fit a big window. */
const RASTER_SCALE = 4;

const started = new Set<SpriteKey>();

/** Starts loading every picture in the manifest, once however often it is called. `areSpritesReady` says when they have all settled. */
export function loadSprites(): void {
  SPRITE_KEYS.forEach(key => {
    if (started.has(key)) {
      return;
    }

    started.add(key);
    void spritesReadiness.trackLoad(loadSprite(key));
  });

  spritesReadiness.markRequested();
}

async function loadSprite(key: SpriteKey): Promise<void> {
  try {
    const canvas = await rasteriseSvg(spriteUrl(key), SPRITE_MANIFEST[key].sizePixels * RASTER_SCALE);
    const texture = new CanvasTexture(canvas);
    // react-three-fiber reads a material's `map` as sRGB, the colour space art drew in, so with no tone mapping the colours reach the screen as drawn.
    spriteTextures.set(key, texture);
  } catch (error) {
    console.warn(`The picture ${key} could not be loaded, so a placeholder is drawn in its place.`, error);
  }
}
