import {useFrame} from "@react-three/fiber";
import {useFeedbackStore} from "@src/store/feedback/UseFeedbackStore";
import {gameState} from "@src/store/game/selectors/game-state/GameState";
import type {JSX} from "react";
import {useRef} from "react";
import type {Group} from "three";

/** Art's incoming-damage coral (`#FF5B62`, the palette's `gs-ring`). */
const CORAL = "#ff5b62";
/** A thin circle just outside the body (which is 0.4 tile in radius) and inside where the brackets stand, in tiles from the body's centre. */
const INNER_RADIUS = 0.5;
const OUTER_RADIUS = 0.56;
const SEGMENTS = 48;

/**
 * A red highlight round the player for as long as the ring is hurting them: a steady thin circle, with no pulse or sound. The loop writes `ringHurting` to the
 * feedback store each step and this reads it each frame inside `useFrame` (no React state). It follows the local player, who is always drawn, so nothing
 * about the opponent shows. Cosmetic: nothing the engine reads.
 */
export function RingHighlight(): JSX.Element {
  const groupRef = useRef<Group>(null);

  useFrame(() => {
    if (!groupRef.current) {
      return;
    }

    groupRef.current.visible = useFeedbackStore.getState().ringHurting;
    const {position} = gameState().player;
    groupRef.current.position.set(position.x, position.y, 1.2);
  });

  return (
    <group ref={groupRef} name="ring-highlight" visible={false}>
      <mesh>
        <ringGeometry args={[INNER_RADIUS, OUTER_RADIUS, SEGMENTS]} />

        <meshBasicMaterial color={CORAL} toneMapped={false} />
      </mesh>
    </group>
  );
}
