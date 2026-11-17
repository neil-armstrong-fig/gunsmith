import type {SpritePoint} from "@src/assets/sprites/types/SpritePoint";

/** What the game needs to know to place a picture: how big it is, and which pixel of it sits on the thing it draws. */
export interface SpriteEntry {
  /** The picture's width and height in pixels, as art drew it (they are square). */
  sizePixels: number;

  /** The pixel, counted from the top left, that goes on the centre of the thing drawn: a fighter's body centre, not the picture's. */
  anchor: SpritePoint;

  /** How many of the picture's pixels make one tile of the arena. */
  pixelsPerTile: number;
}
