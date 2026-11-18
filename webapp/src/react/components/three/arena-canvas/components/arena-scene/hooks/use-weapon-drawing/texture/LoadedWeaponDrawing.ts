import {weaponDrawingTextures} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-weapon-drawing/texture/WeaponDrawingTextures";
import type {CanvasTexture} from "three";

/** The texture made for an appearance once it has loaded, and nothing before, or if it could not be made: the caller draws the placeholder. */
export function loadedWeaponDrawing(appearance: unknown): CanvasTexture | undefined {
  return weaponDrawingTextures.get(appearance);
}
