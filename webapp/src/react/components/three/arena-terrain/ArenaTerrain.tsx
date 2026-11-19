import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import {ArenaHeights} from "@src/react/components/three/arena-terrain/components/arena-heights/ArenaHeights";
import {ArenaWalls} from "@src/react/components/three/arena-terrain/components/arena-walls/ArenaWalls";
import type {JSX} from "react";

interface Props {
  arena: Arena;
}

/** The terrain shared by the live arena and the workshop preview. */
export function ArenaTerrain({arena}: Props): JSX.Element {
  return (
    <>
      <ArenaWalls arena={arena} />

      <ArenaHeights arena={arena} />
    </>
  );
}
