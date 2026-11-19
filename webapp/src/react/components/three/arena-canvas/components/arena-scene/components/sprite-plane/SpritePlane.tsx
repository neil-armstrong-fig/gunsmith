import {SPRITE_MANIFEST} from "@src/assets/sprites/SpriteManifest";
import {spritePlacementOf} from "@src/react/components/three/arena-canvas/components/arena-scene/components/sprite-plane/placement/SpritePlacementOf";
import type {SpriteKey} from "@src/assets/sprites/types/SpriteKey";
import {useSprite} from "@src/react/sprites/hooks/use-sprite/UseSprite";
import type {JSX, Ref} from "react";
import type {Mesh} from "three";

interface Props {
  spriteKey: SpriteKey;
  visible?: boolean;
  ref?: Ref<Mesh>;
}

/**
 * One of art's pictures, flat in the arena, placed so its anchor pixel (a fighter's body centre) is at the origin of whatever it is drawn in. Nothing until the picture
 * has loaded, so the caller shows a placeholder meanwhile. Its colours reach the screen as art drew them: no tone mapping, which the palette's colours would not survive.
 */
export function SpritePlane({spriteKey, visible = true, ref}: Props): JSX.Element | null {
  const texture = useSprite(spriteKey);
  if (!texture) {
    return null;
  }

  const {width, height, offset} = spritePlacementOf(SPRITE_MANIFEST[spriteKey]);

  return (
    <mesh ref={ref} visible={visible} position={[offset.x, offset.y, 0]}>
      <planeGeometry args={[width, height]} />

      <meshBasicMaterial map={texture} transparent toneMapped={false} />
    </mesh>
  );
}
