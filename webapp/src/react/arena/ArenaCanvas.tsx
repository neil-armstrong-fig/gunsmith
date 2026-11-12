import {Canvas} from "@react-three/fiber";
import {PlayerSquare} from "@src/react/arena/PlayerSquare";
import type {JSX} from "react";

/** A top-down view: an orthographic camera looking straight down at the arena floor. */
export function ArenaCanvas(): JSX.Element {
  return (
    <Canvas orthographic camera={{zoom: 50, position: [0, 0, 10]}}>
      <color attach="background" args={["#0b1020"]} />
      <gridHelper args={[60, 60, "#2a3a66", "#16203d"]} rotation={[Math.PI / 2, 0, 0]} />
      <PlayerSquare />
    </Canvas>
  );
}
