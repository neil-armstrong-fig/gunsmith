import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import {levelColour} from "@src/react/components/three/arena-canvas/components/arena-scene/components/arena-heights/colours/LevelColour";
import {useHeightTiles} from "@src/react/components/three/arena-canvas/components/arena-scene/components/arena-heights/hooks/use-height-tiles/UseHeightTiles";
import {stairStripsOf} from "@src/react/components/three/arena-canvas/components/arena-scene/components/arena-heights/stairs/StairStripsOf";
import type {JSX} from "react";
import {Color} from "three";

interface Props {
  arena: Arena;
}

/** Raised floor, a step lighter for each level, and each stair as bands shaded from its low floor to its high one. No labels. */
export function ArenaHeights({arena}: Props): JSX.Element {
  const {floors, stairs} = useHeightTiles(arena);

  return (
    <group>
      {floors.map(floor => (
        <mesh key={`${floor.x},${floor.y}`} position={[floor.x + 0.5, floor.y + 0.5, 0.05]}>
          <planeGeometry args={[1, 1]} />

          <meshBasicMaterial color={levelColour(floor.level)} />
        </mesh>
      ))}

      {stairs.map(stair =>
        stairStripsOf(stair.uphill).map(strip => (
          <mesh
            key={`${stair.x},${stair.y},${strip.x},${strip.y}`}
            position={[stair.x + strip.x + strip.width / 2, stair.y + strip.y + strip.height / 2, 0.06]}
          >
            <planeGeometry args={[strip.width, strip.height]} />

            <meshBasicMaterial
              color={new Color(levelColour(stair.level)).lerp(new Color(levelColour(stair.level + 1)), strip.fraction)}
            />
          </mesh>
        )),
      )}
    </group>
  );
}
