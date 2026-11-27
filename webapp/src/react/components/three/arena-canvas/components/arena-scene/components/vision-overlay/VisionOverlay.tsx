import {useFrame} from "@react-three/fiber";
import {coneOf} from "@gunsmith/engine/vision/ConeOf";
import {visibleArea} from "@gunsmith/engine/vision/VisibleArea";
import {dimmedGeometry} from "@src/react/components/three/arena-canvas/components/arena-scene/components/vision-overlay/geometry/DimmedGeometry";
import {gameState} from "@src/store/game/selectors/game-state/GameState";
import type {JSX} from "react";
import {useRef} from "react";
import type {Mesh} from "three";

/**
 * A dark veil over the whole arena with what the player sees cut out of it (`visibleArea`: their cone, less the ground they look
 * across without seeing, such as the low ground below a platform on the way to another on the same level), so the terrain they do
 * not see is still there but dim, and what they see shows in detail. It sits above the walls and below the fighters, and is rebuilt
 * each frame by the same sight rule the server uses to decide what to send.
 */
export function VisionOverlay(): JSX.Element {
  const veilRef = useRef<Mesh>(null);

  useFrame(() => {
    if (!veilRef.current) {
      return;
    }

    const {arena, player} = gameState();
    const next = dimmedGeometry(arena, visibleArea(arena, coneOf(arena, player)));

    veilRef.current.geometry.dispose();
    veilRef.current.geometry = next;
  });

  return (
    <mesh ref={veilRef} position={[0, 0, 0.9]} name="vision-overlay">
      <bufferGeometry />

      <meshBasicMaterial color="#05080c" transparent opacity={0.5} depthWrite={false} />
    </mesh>
  );
}
