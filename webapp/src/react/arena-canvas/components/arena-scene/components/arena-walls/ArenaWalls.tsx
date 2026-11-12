import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import {useWallTiles} from "@src/react/arena-canvas/components/arena-scene/components/arena-walls/hooks/use-wall-tiles/UseWallTiles";
import type {JSX} from "react";

interface Props {
  arena: Arena;
}

/** The floor, and a block for every wall tile. */
export function ArenaWalls({arena}: Props): JSX.Element {
  const wallTiles = useWallTiles(arena);

  return (
    <group>
      <mesh position={[arena.width / 2, arena.height / 2, 0]}>
        <planeGeometry args={[arena.width, arena.height]} />
        <meshBasicMaterial color="#202b36" />
      </mesh>

      {wallTiles.map(tile => (
        <mesh key={`${tile.x},${tile.y}`} position={[tile.x + 0.5, tile.y + 0.5, 0.5]}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial color="#596572" />
        </mesh>
      ))}
    </group>
  );
}
