import {useFrame} from "@react-three/fiber";
import {useWasdMovement} from "@src/react/arena/UseWasdMovement";
import type {JSX} from "react";
import {useRef} from "react";
import type {Mesh} from "three";

const UNITS_PER_SECOND = 6;

/** The Phase 0 stand-in for a player: a square that WASD moves. */
export function PlayerSquare(): JSX.Element {
  const squareRef = useRef<Mesh>(null);
  const directionRef = useWasdMovement();

  useFrame((_state, secondsSinceLastFrame) => {
    if (!squareRef.current) {
      return;
    }

    squareRef.current.position.x += directionRef.current.x * UNITS_PER_SECOND * secondsSinceLastFrame;
    squareRef.current.position.y += directionRef.current.y * UNITS_PER_SECOND * secondsSinceLastFrame;
  });

  return (
    <mesh ref={squareRef} name="player" data-testid="player">
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial color="#38f2c9" />
    </mesh>
  );
}
