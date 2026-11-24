import type {SpriteKey} from "@src/assets/sprites/types/SpriteKey";
import {SPRITE_MANIFEST} from "@src/assets/sprites/SpriteManifest";
import {spritePlacementOf} from "@src/react/components/three/arena-canvas/components/arena-scene/components/sprite-plane/placement/SpritePlacementOf";
import type {JSX} from "react";
import type {CanvasTexture} from "three";

interface Props {
  spriteKey: SpriteKey;
  picture: CanvasTexture;
}

/** What an instanced mesh of shots is made of once art's picture has loaded: a plane the size of the picture, which shows as art drew it (no tone mapping). */
export function ShotPicture({spriteKey, picture}: Props): JSX.Element {
  const {width, height} = spritePlacementOf(SPRITE_MANIFEST[spriteKey]);

  return (
    <>
      <planeGeometry args={[width, height]} />

      <meshBasicMaterial map={picture} transparent depthWrite={false} toneMapped={false} />
    </>
  );
}
