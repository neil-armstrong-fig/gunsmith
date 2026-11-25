import {useFrame} from "@react-three/fiber";
import type {Shooter} from "@gunsmith/engine/bullet/types/Shooter";
import {visibleToPlayer} from "@gunsmith/engine/vision/VisibleToPlayer";
import {SPRITE_MANIFEST} from "@src/assets/sprites/SpriteManifest";
import {shotSpriteKeyOf} from "@src/react/components/three/arena-canvas/components/arena-scene/components/bullets/shots/key/ShotSpriteKeyOf";
import {shotPlacementOf} from "@src/react/components/three/arena-canvas/components/arena-scene/components/bullets/shots/placement/ShotPlacementOf";
import {ShotPicture} from "@src/react/components/three/arena-canvas/components/arena-scene/components/bullets/shots/shot-picture/ShotPicture";
import {ShotPlaceholder} from "@src/react/components/three/arena-canvas/components/arena-scene/components/bullets/shots/shot-placeholder/ShotPlaceholder";
import {spritePlacementOf} from "@src/react/components/three/arena-canvas/components/arena-scene/components/sprite-plane/placement/SpritePlacementOf";
import {useSprite} from "@src/react/sprites/hooks/use-sprite/UseSprite";
import {gameState} from "@src/store/game/selectors/game-state/GameState";
import type {JSX} from "react";
import {useRef, useState} from "react";
import {Object3D} from "three";
import type {CanvasTexture, InstancedMesh} from "three";

interface Props {
  shooter: Shooter;
}

/** More shots than this cannot be in the air at once at the current fire rate, with room to spare. */
const MOST_SHOTS_DRAWN = 64;

/**
 * The mesh itself stands at depth 0 (each shot is placed at 1 in its own matrix), so left to depth order it would be drawn before the vision veil
 * (at 0.9) and its whole picture, transparent corners too, would keep the veil off the floor under it: a lit square round every shot outside the
 * cone. A render order past the veil's draws the shots on top of it.
 */
const AFTER_THE_VISION_VEIL = 1;

/**
 * Every bullet of one side in the air that the player sees (the opponent's only inside the cone), drawn from art's picture of a shot with its tip on the bullet and lying
 * along the way it flies. A small gold disc shows until the picture has loaded, or if it could not.
 */
export function Shots({shooter}: Props): JSX.Element {
  const meshRef = useRef<InstancedMesh>(null);
  const [placement] = useState(() => new Object3D());
  const spriteKey = shotSpriteKeyOf(shooter);
  const picture = useSprite(spriteKey);
  const {offset} = spritePlacementOf(SPRITE_MANIFEST[spriteKey]);

  useFrame(() => {
    if (!meshRef.current) {
      return;
    }

    const world = gameState();
    const shown = visibleToPlayer(world).bullets;
    const shots = world.bullets
      .filter((bullet, index) => bullet.shooter === shooter && shown[index])
      .slice(0, MOST_SHOTS_DRAWN);
    meshRef.current.count = shots.length;

    shots.forEach((shot, index) => {
      // Without a picture the disc is drawn on the bullet itself, with none of the picture's offset.
      const {x, y, angle} = shotPlacementOf(shot, picture ? offset : {x: 0, y: 0});
      placement.position.set(x, y, 1);
      placement.rotation.set(0, 0, angle);
      placement.updateMatrix();
      meshRef.current?.setMatrixAt(index, placement.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      key={meshKeyOf(picture)}
      ref={meshRef}
      args={[undefined, undefined, MOST_SHOTS_DRAWN]}
      frustumCulled={false}
      renderOrder={AFTER_THE_VISION_VEIL}
    >
      {picture && <ShotPicture spriteKey={spriteKey} picture={picture} />}

      {!picture && <ShotPlaceholder />}
    </instancedMesh>
  );
}

/** A new mesh when the picture arrives, since an instanced mesh keeps the geometry and material it was made with. */
function meshKeyOf(picture: CanvasTexture | undefined): string {
  if (picture) {
    return "picture";
  }

  return "placeholder";
}
