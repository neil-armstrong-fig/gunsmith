import type {Point} from "@gunsmith/engine/geometry/types/Point";
import type {FlyingShot} from "@src/react/components/three/arena-canvas/components/arena-scene/components/bullets/shots/placement/types/FlyingShot";
import type {ShotPlacement} from "@src/react/components/three/arena-canvas/components/arena-scene/components/bullets/shots/placement/types/ShotPlacement";

/**
 * Where to put a shot's picture so that the picture's anchor (its tip) is on the bullet, and the picture lies along the way the bullet flies. `offset` is where the
 * picture's centre is from the anchor when it faces east, in tiles (`spritePlacementOf`), which is turned with the picture, about the bullet.
 */
export function shotPlacementOf(shot: FlyingShot, offset: Point): ShotPlacement {
  const {position, direction} = shot;

  return {
    x: position.x + offset.x * direction.x - offset.y * direction.y,
    y: position.y + offset.x * direction.y + offset.y * direction.x,
    angle: Math.atan2(direction.y, direction.x),
  };
}
