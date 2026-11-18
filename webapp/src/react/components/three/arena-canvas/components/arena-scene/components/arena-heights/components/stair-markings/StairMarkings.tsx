import {stairMarkingsOf} from "@src/react/components/three/arena-canvas/components/arena-scene/components/arena-heights/components/stair-markings/geometry/StairMarkingsOf";
import type {StairTile} from "@src/react/components/three/arena-canvas/components/arena-scene/components/arena-heights/hooks/use-height-tiles/tiles/types/types/StairTile";
import type {JSX} from "react";

interface Props {
  stair: StairTile;
  colour: string;
}

export function StairMarkings({stair, colour}: Props): JSX.Element {
  const {treads, rails} = stairMarkingsOf(stair.uphill);

  return (
    <group position={[stair.x + 0.5, stair.y + 0.5, 0.08]}>
      {[...treads, ...rails].map(({x, y, width, height}) => (
        <mesh key={`${x},${y}`} position={[x, y, 0]}>
          <planeGeometry args={[width, height]} />

          <meshBasicMaterial color={colour} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}
