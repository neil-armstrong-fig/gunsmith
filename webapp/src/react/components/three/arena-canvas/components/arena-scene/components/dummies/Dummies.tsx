import {useFrame} from "@react-three/fiber";
import {DUMMY_HEALTH} from "@gunsmith/engine/dummy/DummyHealth";
import {DUMMY_RADIUS} from "@gunsmith/engine/dummy/DummyRadius";
import {gameState} from "@src/store/game/selectors/game-state/GameState";
import type {JSX} from "react";
import {useRef, useState} from "react";
import {Color, Object3D} from "three";
import type {InstancedMesh} from "three";

/** More dummies than this are not drawn; the practice range has a handful. */
const MOST_DUMMIES_DRAWN = 16;

/** A dummy shows this colour when whole and fades toward the other as it is hurt. */
const WHOLE = new Color("#f08a5d");
const NEARLY_GONE = new Color("#4a3a38");

/** Every dummy still standing, drawn as a disc where the simulation says it is, dimmer the more it has been hurt. */
export function Dummies(): JSX.Element {
  const meshRef = useRef<InstancedMesh>(null);
  const [placement] = useState(() => new Object3D());
  const [tint] = useState(() => new Color());

  useFrame(() => {
    if (!meshRef.current) {
      return;
    }

    const dummies = gameState().dummies.slice(0, MOST_DUMMIES_DRAWN);
    meshRef.current.count = dummies.length;

    dummies.forEach((dummy, index) => {
      placement.position.set(dummy.position.x, dummy.position.y, 0.8);
      placement.updateMatrix();
      meshRef.current?.setMatrixAt(index, placement.matrix);
      meshRef.current?.setColorAt(index, tint.copy(NEARLY_GONE).lerp(WHOLE, dummy.health / DUMMY_HEALTH));
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, MOST_DUMMIES_DRAWN]} frustumCulled={false}>
      <circleGeometry args={[DUMMY_RADIUS, 32]} />

      <meshBasicMaterial color="#ffffff" />
    </instancedMesh>
  );
}
