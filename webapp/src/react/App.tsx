import {AmmoHud} from "@src/react/components/dom/ammo-hud/AmmoHud";
import {ArenaCanvas} from "@src/react/components/three/arena-canvas/ArenaCanvas";
import type {JSX} from "react";

/** The game is the whole window, with the heads-up display over it. Menus will appear over it only when they are needed. */
export function App(): JSX.Element {
  return (
    <>
      <ArenaCanvas />

      <AmmoHud />
    </>
  );
}
