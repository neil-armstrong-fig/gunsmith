import {SPRITE_MANIFEST} from "@src/assets/sprites/SpriteManifest";
import {spritePlacementOf} from "@src/react/components/three/arena-canvas/components/arena-scene/components/sprite-plane/placement/SpritePlacementOf";
import type {JSX} from "react";
import type {CanvasTexture} from "three";

interface Props {
  picture: CanvasTexture;
}

/** What an instanced mesh of dummies is made of once art's picture has loaded: a plane the size of the picture, which shows as art drew it (no tone mapping). */
export function DummyPicture({picture}: Props): JSX.Element {
  const {width, height} = spritePlacementOf(SPRITE_MANIFEST["sprite-dummy"]);

  return (
    <>
      <planeGeometry args={[width, height]} />

      <meshBasicMaterial map={picture} transparent toneMapped={false} />
    </>
  );
}
