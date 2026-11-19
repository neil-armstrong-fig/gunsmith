import {APPEARANCE_LIMITS} from "@gunsmith/shared/appearance/schema/AppearanceLimits";
import {CanvasTexture} from "three";
import {rasteriseSvg} from "@src/react/components/three/arena-canvas/sprites/load-sprites/raster/RasteriseSvg";
import {spritesReadiness} from "@src/react/components/three/arena-canvas/sprites/SpritesReadiness";
import {weaponDrawingTextures} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-weapon-drawing/texture/WeaponDrawingTextures";
import {appearanceToDraw} from "@src/assets/weapon-drawings/appearance-to-draw/AppearanceToDraw";
import {appearanceSvg} from "@src/assets/weapon-drawings/svg/AppearanceSvg";

/** A drawing is rasterised this many times bigger than its design space, so it stays sharp when the arena is zoomed to fit a big window (as `loadSprites` does for art's pictures). */
const RASTER_SCALE = 4;

const started = new Set<unknown>();

/**
 * Starts making the texture for an appearance, once however often it is called: parsed (a refused one becomes the stand-in), drawn as an SVG and rasterised. It counts
 * as a picture still loading until it settles, so `data-sprites-ready` waits for it and a spec never reads the placeholder.
 */
export function loadWeaponDrawing(appearance: unknown): void {
  if (started.has(appearance)) {
    return;
  }

  started.add(appearance);
  void spritesReadiness.trackLoad(makeTexture(appearance));
}

async function makeTexture(appearance: unknown): Promise<void> {
  const svg = appearanceSvg(appearanceToDraw(appearance), ["structural"]);
  const url = URL.createObjectURL(new Blob([svg], {type: "image/svg+xml"}));

  try {
    const canvas = await rasteriseSvg(url, APPEARANCE_LIMITS.space * RASTER_SCALE);
    weaponDrawingTextures.set(appearance, new CanvasTexture(canvas));
  } catch (error) {
    console.warn("A weapon's drawing could not be made, so the placeholder is drawn in its place.", error);
  } finally {
    URL.revokeObjectURL(url);
  }
}
