import type {SpriteOffset} from "@src/react/components/three/arena-canvas/components/arena-scene/components/sprite-plane/placement/types/SpriteOffset";

/** Where a flat picture goes, in the arena's tiles, relative to the thing it draws (`y` grows to the north, as everywhere in the arena). */
export interface SpritePlacement {
  /** How wide and high the picture is drawn. */
  width: number;
  height: number;

  /** Where the picture's own centre sits, from the point it is anchored on. */
  offset: SpriteOffset;
}
