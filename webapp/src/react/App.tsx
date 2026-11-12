import {ArenaCanvas} from "@src/react/arena-canvas/ArenaCanvas";
import type {JSX} from "react";

/** The game is the whole window. Menus will appear over it only when they are needed. */
export function App(): JSX.Element {
  return <ArenaCanvas />;
}
