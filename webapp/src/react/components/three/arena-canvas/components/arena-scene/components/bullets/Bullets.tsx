import {Shots} from "@src/react/components/three/arena-canvas/components/arena-scene/components/bullets/shots/Shots";
import type {JSX} from "react";

/** Every bullet in the air that the player sees, each side's in its own colour: the player's blue, the opponent's orange. */
export function Bullets(): JSX.Element {
  return (
    <>
      <Shots shooter="player" />

      <Shots shooter="opponent" />
    </>
  );
}
