import {useFrame} from "@react-three/fiber";
import {PLAYER_RADIUS} from "@gunsmith/engine/player/PlayerRadius";
import {gameState} from "@src/store/game/selectors/game-state/GameState";
import type {JSX} from "react";
import {useRef} from "react";
import type {Group} from "three";

/** The player: a disc the size of the circle that walls stop, with a barrel pointing the way they are aiming. */
export function PlayerDisc(): JSX.Element {
  const playerRef = useRef<Group>(null);

  useFrame(() => {
    if (!playerRef.current) {
      return;
    }

    const {position, aim} = gameState().player;
    playerRef.current.position.set(position.x, position.y, 1);
    playerRef.current.rotation.z = Math.atan2(aim.y, aim.x);
  });

  return (
    <group ref={playerRef} name="player" data-testid="player">
      <mesh>
        <circleGeometry args={[PLAYER_RADIUS, 32]} />

        <meshBasicMaterial color="#62b5ff" />
      </mesh>

      <mesh position={[PLAYER_RADIUS + 0.1, 0, 0.1]}>
        <planeGeometry args={[0.5, 0.14]} />

        <meshBasicMaterial color="#e5eaf0" />
      </mesh>
    </group>
  );
}
