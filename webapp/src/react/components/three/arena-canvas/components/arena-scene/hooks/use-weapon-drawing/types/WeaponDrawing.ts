import type {SpriteEntry} from "@src/assets/sprites/types/SpriteEntry";
import type {CanvasTexture} from "three";

export interface WeaponDrawing {
  texture: CanvasTexture;
  sprite: SpriteEntry;
}
