import {useFrame} from "@react-three/fiber";
import type {World} from "@gunsmith/engine/game-loop/types/World";
import type {JSX, RefObject} from "react";
import {useRef, useState} from "react";
import {Object3D} from "three";
import type {InstancedMesh} from "three";

/** More bullets than this cannot be in the air at once at the current fire rate, with room to spare. */
const MOST_BULLETS_DRAWN = 64;

interface Props {
  worldRef: RefObject<World>;
}

/** Every bullet in the air, drawn as a small disc where the simulation says it is. */
export function Bullets({worldRef}: Props): JSX.Element {
  const meshRef = useRef<InstancedMesh>(null);
  const [placement] = useState(() => new Object3D());

  useFrame(() => {
    if (!meshRef.current) {
      return;
    }

    const bullets = worldRef.current.bullets.slice(0, MOST_BULLETS_DRAWN);
    meshRef.current.count = bullets.length;

    bullets.forEach((bullet, index) => {
      placement.position.set(bullet.position.x, bullet.position.y, 1);
      placement.updateMatrix();
      meshRef.current?.setMatrixAt(index, placement.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, MOST_BULLETS_DRAWN]} frustumCulled={false}>
      <circleGeometry args={[0.1, 12]} />
      <meshBasicMaterial color="#f2c66d" />
    </instancedMesh>
  );
}
