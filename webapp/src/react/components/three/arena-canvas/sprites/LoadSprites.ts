import {CanvasTexture} from "three";
import {SPRITE_KEYS} from "@src/assets/sprites/SpriteKeys";
import {SPRITE_MANIFEST, spriteUrl} from "@src/assets/sprites/SpriteManifest";
import type {SpriteKey} from "@src/assets/sprites/types/SpriteKey";
import {rasteriseSvg} from "@src/react/components/three/arena-canvas/sprites/raster/RasteriseSvg";
import {markSpritesRequested, trackLoad} from "@src/react/components/three/arena-canvas/sprites/SpritesReadiness";

/** A picture is drawn this many times bigger than art's size, so it stays sharp when the arena is zoomed to fit a big window. */
const RASTER_SCALE = 4;

const started = new Set<SpriteKey>();
const textures = new Map<SpriteKey, CanvasTexture>();

/** Starts loading every picture in the manifest, once however often it is called. `areSpritesReady` says when they have all settled. */
export function loadSprites(): void {
  SPRITE_KEYS.forEach(key => {
    if (started.has(key)) {
      return;
    }

    started.add(key);
    void trackLoad(loadSprite(key));
  });

  markSpritesRequested();
}

/** A picture's texture once it has loaded, and nothing before, or if the file could not be loaded: the caller draws a placeholder. */
export function loadedSprite(key: SpriteKey): CanvasTexture | undefined {
  return textures.get(key);
}

async function loadSprite(key: SpriteKey): Promise<void> {
  try {
    const canvas = await rasteriseSvg(spriteUrl(key), SPRITE_MANIFEST[key].sizePixels * RASTER_SCALE);
    const texture = new CanvasTexture(canvas);
    // react-three-fiber reads a material's `map` as sRGB, the colour space art drew in, so with no tone mapping the colours reach the screen as drawn.
    textures.set(key, texture);
  } catch (error) {
    console.warn(`The picture ${key} could not be loaded, so a placeholder is drawn in its place.`, error);
  }
}
