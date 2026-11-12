import {useFrame} from "@react-three/fiber";
import {PLAYER_RADIUS} from "@gunsmith/engine/player/PlayerRadius";
import {gameState} from "@src/store/game/selectors/game-state/GameState";
import type {JSX} from "react";
import {useRef} from "react";
import type {Group} from "three";

/** The opponent: a disc the size of the player's, in the other team's colour, with a barrel pointing the way it faces. Hidden when the match has none. */
export function Opponent(): JSX.Element {
  const opponentRef = useRef<Group>(null);

  useFrame(() => {
    if (!opponentRef.current) {
      return;
    }

    const {opponent} = gameState();
    opponentRef.current.visible = opponent !== undefined;

    if (!opponent) {
      return;
    }

    opponentRef.current.position.set(opponent.position.x, opponent.position.y, 1);
    opponentRef.current.rotation.z = Math.atan2(opponent.aim.y, opponent.aim.x);
  });

  return (
    <group ref={opponentRef} name="opponent" visible={false}>
      <mesh>
        <circleGeometry args={[PLAYER_RADIUS, 32]} />

        <meshBasicMaterial color="#ff9b54" />
      </mesh>

      <mesh position={[PLAYER_RADIUS + 0.1, 0, 0.1]}>
        <planeGeometry args={[0.5, 0.14]} />

        <meshBasicMaterial color="#e5eaf0" />
      </mesh>
    </group>
  );
}
