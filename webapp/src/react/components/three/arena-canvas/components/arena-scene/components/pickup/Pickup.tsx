import {useFrame} from "@react-three/fiber";
import {visibleToPlayer} from "@gunsmith/engine/vision/VisibleToPlayer";
import {gameState} from "@src/store/game/selectors/game-state/GameState";
import type {JSX} from "react";
import {useRef} from "react";
import type {Mesh} from "three";

/** How big the disc is, in tiles: a little smaller than a fighter, so it reads as something lying on the floor. */
const PICKUP_DISC_RADIUS = 0.3;

/** A plain placeholder colour; `art`'s pickup glow replaces it once the manifest has one. */
const PICKUP_COLOUR = "#7ee0c3";

/** The weapon lying in the arena, drawn as a disc where the simulation says it is, and only while the player sees it. */
export function Pickup(): JSX.Element {
  const meshRef = useRef<Mesh>(null);

  useFrame(() => {
    if (!meshRef.current) {
      return;
    }

    const world = gameState();
    const {pickup} = world;
    meshRef.current.visible = pickup !== undefined && visibleToPlayer(world).pickup;
    if (pickup) {
      meshRef.current.position.set(pickup.position.x, pickup.position.y, 0.7);
    }
  });

  return (
    <mesh ref={meshRef} visible={false} frustumCulled={false}>
      <circleGeometry args={[PICKUP_DISC_RADIUS, 32]} />

      <meshBasicMaterial color={PICKUP_COLOUR} />
    </mesh>
  );
}
