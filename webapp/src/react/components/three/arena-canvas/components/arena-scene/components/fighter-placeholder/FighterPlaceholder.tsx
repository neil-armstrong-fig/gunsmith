import {PLAYER_RADIUS} from "@gunsmith/engine/player/PlayerRadius";
import type {JSX} from "react";

interface Props {
  colour: string;
}

/** A fighter before art's picture of them has loaded, or when it could not be: a disc the size of the circle walls stop, with a barrel pointing the way they face. */
export function FighterPlaceholder({colour}: Props): JSX.Element {
  return (
    <>
      <mesh>
        <circleGeometry args={[PLAYER_RADIUS, 32]} />

        <meshBasicMaterial color={colour} />
      </mesh>

      <mesh position={[PLAYER_RADIUS + 0.1, 0, 0.1]}>
        <planeGeometry args={[0.5, 0.14]} />

        <meshBasicMaterial color="#e5eaf0" />
      </mesh>
    </>
  );
}
