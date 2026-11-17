import type {SpriteEntry} from "@src/assets/sprites/types/SpriteEntry";
import type {SpritePlacement} from "@src/react/components/three/arena-canvas/components/arena-scene/components/sprite-plane/placement/types/SpritePlacement";

/**
 * Where to put a picture so its anchor pixel lands on the thing it draws. The picture is a flat plane centred on itself, so the plane's centre is
 * moved from the anchor by the pixels between them, turned into tiles; a picture's `y` grows downward and the arena's grows north, so that one flips.
 */
export function spritePlacementOf(entry: SpriteEntry): SpritePlacement {
  const centre = entry.sizePixels / 2;

  return {
    width: entry.sizePixels / entry.pixelsPerTile,
    height: entry.sizePixels / entry.pixelsPerTile,
    offset: {
      x: (centre - entry.anchor.x) / entry.pixelsPerTile,
      y: (entry.anchor.y - centre) / entry.pixelsPerTile,
    },
  };
}
