import {useFrame} from "@react-three/fiber";
import {DUMMY_HEALTH} from "@gunsmith/engine/dummy/DummyHealth";
import {visibleToPlayer} from "@gunsmith/engine/vision/VisibleToPlayer";
import {DummyPicture} from "@src/react/components/three/arena-canvas/components/arena-scene/components/dummies/dummy-picture/DummyPicture";
import {DummyPlaceholder} from "@src/react/components/three/arena-canvas/components/arena-scene/components/dummies/dummy-placeholder/DummyPlaceholder";
import {useSprite} from "@src/react/sprites/hooks/use-sprite/UseSprite";
import {gameState} from "@src/store/game/selectors/game-state/GameState";
import type {JSX} from "react";
import {useRef, useState} from "react";
import {Color, Object3D} from "three";
import type {CanvasTexture, InstancedMesh} from "three";

/** More dummies than this are not drawn; the practice range has a handful. */
const MOST_DUMMIES_DRAWN = 16;

/**
 * A dummy shows its own colours when whole and fades toward a dark tint as it is hurt. The picture is multiplied by the tint, so a whole dummy is white (art's colours
 * untouched); the placeholder disc, which has no picture of its own, is orange when whole.
 */
const WHOLE_PICTURE = new Color("#ffffff");
const WHOLE_PLACEHOLDER = new Color("#f08a5d");
const NEARLY_GONE = new Color("#4a3a38");

/**
 * Every dummy still standing that the player sees, drawn from art's picture where the simulation says it is, dimmer the more it has been hurt. A placeholder disc shows
 * until the picture has loaded, or if it could not.
 */
export function Dummies(): JSX.Element {
  const meshRef = useRef<InstancedMesh>(null);
  const [placement] = useState(() => new Object3D());
  const [tint] = useState(() => new Color());
  const picture = useSprite("sprite-dummy");
  const whole = wholeColourOf(picture);

  useFrame(() => {
    if (!meshRef.current) {
      return;
    }

    const world = gameState();
    const seen = visibleToPlayer(world).dummies;
    const dummies = world.dummies.filter((_, index) => seen[index]).slice(0, MOST_DUMMIES_DRAWN);
    meshRef.current.count = dummies.length;

    dummies.forEach((dummy, index) => {
      placement.position.set(dummy.position.x, dummy.position.y, 0.8);
      placement.updateMatrix();
      meshRef.current?.setMatrixAt(index, placement.matrix);
      meshRef.current?.setColorAt(index, tint.copy(NEARLY_GONE).lerp(whole, dummy.health / DUMMY_HEALTH));
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  });

  return (
    <instancedMesh
      key={meshKeyOf(picture)}
      ref={meshRef}
      args={[undefined, undefined, MOST_DUMMIES_DRAWN]}
      frustumCulled={false}
    >
      {picture && <DummyPicture picture={picture} />}

      {!picture && <DummyPlaceholder />}
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

/** The colour a whole dummy is tinted: white over art's picture, which then shows as drawn, and orange for the placeholder disc. */
function wholeColourOf(picture: CanvasTexture | undefined): Color {
  if (picture) {
    return WHOLE_PICTURE;
  }

  return WHOLE_PLACEHOLDER;
}
