import {SPRITE_MANIFEST} from "@src/assets/sprites/SpriteManifest";
import {spritePlacementOf} from "@src/react/components/three/arena-canvas/components/arena-scene/components/sprite-plane/placement/SpritePlacementOf";
import type {SpritePlacement} from "@src/react/components/three/arena-canvas/components/arena-scene/components/sprite-plane/placement/types/SpritePlacement";
import type {WeaponDrawing} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-weapon-drawing/types/WeaponDrawing";
import type {JSX} from "react";

interface Props {
  drawing: WeaponDrawing;
  held?: boolean;
}

/** Draws the same weapon texture on the ground or in hand. Only placement and scale differ. */
export function WeaponDrawingPlane({drawing, held = false}: Props): JSX.Element {
  const {width, height, offset} = placementOfWeapon(drawing, held);

  return (
    <mesh frustumCulled={false} position={[offset.x, offset.y, 0]}>
      <planeGeometry args={[width, height]} />

      <meshBasicMaterial map={drawing.texture} transparent toneMapped={false} />
    </mesh>
  );
}

function placementOfWeapon({sprite}: WeaponDrawing, held: boolean): SpritePlacement {
  if (held) {
    return spritePlacementOf(sprite);
  }

  const centre = sprite.sizePixels / 2;

  return spritePlacementOf({
    sizePixels: sprite.sizePixels,
    anchor: {x: centre, y: centre},
    pixelsPerTile: SPRITE_MANIFEST["sprite-pickup-marker"].pixelsPerTile,
  });
}
