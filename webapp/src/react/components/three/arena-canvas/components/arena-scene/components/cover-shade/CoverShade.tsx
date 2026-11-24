import {useFrame} from "@react-three/fiber";
import {hidingPlacesOf} from "@gunsmith/engine/cover/HidingPlacesOf";
import {coneOf} from "@gunsmith/engine/vision/ConeOf";
import {shadeGeometry} from "@src/react/components/three/arena-canvas/components/arena-scene/components/cover-shade/geometry/ShadeGeometry";
import {gameState} from "@src/store/game/selectors/game-state/GameState";
import type {JSX} from "react";
import {useRef} from "react";
import type {Mesh} from "three";

/**
 * A faint shade on the floor where a crouched fighter would be hidden from the player, just behind each cover block, and only where the player sees
 * the floor. It suggests where someone could be hiding, never whether anyone is: the places come from the engine's own hiding rule
 * (`hidingPlacesOf`) and the player's own cone, so they can say nothing about the opponent. It sits above the floor and below the dim veil and the fighters.
 */
export function CoverShade(): JSX.Element {
  const shadeRef = useRef<Mesh>(null);

  useFrame(() => {
    if (!shadeRef.current) {
      return;
    }

    const {arena, player} = gameState();
    const next = shadeGeometry(hidingPlacesOf(arena, coneOf(arena, player)));

    shadeRef.current.geometry.dispose();
    shadeRef.current.geometry = next;
  });

  return (
    <mesh ref={shadeRef} position={[0, 0, 0.85]} name="cover-shade">
      <bufferGeometry />

      <meshBasicMaterial color="#05080c" transparent opacity={0.18} depthWrite={false} />
    </mesh>
  );
}
