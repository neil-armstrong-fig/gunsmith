import type {CanvasTexture} from "three";

/** The textures of the drawings that have loaded, by the appearance object they were made from: `loadWeaponDrawing` fills it, `loadedWeaponDrawing` reads it. */
export const weaponDrawingTextures = new Map<unknown, CanvasTexture>();
