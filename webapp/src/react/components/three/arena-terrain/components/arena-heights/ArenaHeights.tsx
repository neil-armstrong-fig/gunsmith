import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import {levelColour} from "@src/react/components/three/arena-terrain/components/arena-heights/colours/LevelColour";
import {StairMarkings} from "@src/react/components/three/arena-terrain/components/arena-heights/components/stair-markings/StairMarkings";
import {dropStripsOf} from "@src/react/components/three/arena-terrain/components/arena-heights/drops/DropStripsOf";
import {useHeightTiles} from "@src/react/components/three/arena-terrain/components/arena-heights/hooks/use-height-tiles/UseHeightTiles";
import {stairStripsOf} from "@src/react/components/three/arena-terrain/components/arena-heights/stairs/StairStripsOf";
import {useSprite} from "@src/react/sprites/hooks/use-sprite/UseSprite";
import type {JSX} from "react";
import type {CanvasTexture} from "three";
import {Color} from "three";

const TERRAIN_EDGE_COLOUR = "#91a2b2";

interface Props {
  arena: Arena;
}

/**
 * Raised floor, a step lighter for each level; a bright lip along each edge where it drops away, with a shadow on the lower ground
 * beside it, so an edge reads as a cliff; and each stair as bands shaded from its low floor to its high one. No labels.
 */
export function ArenaHeights({arena}: Props): JSX.Element {
  const {floors, stairs, drops} = useHeightTiles(arena);
  const middleFloor = useSprite("tile-floor-l2");
  const highestFloor = useSprite("tile-floor-l3");

  return (
    <group>
      {floors.map(floor => {
        const texture = textureForRaisedFloor(floor.level, middleFloor, highestFloor);

        return (
          <mesh key={`${floor.x},${floor.y}`} position={[floor.x + 0.5, floor.y + 0.5, 0.05]}>
            <planeGeometry args={[1, 1]} />

            {texture && <meshBasicMaterial map={texture} toneMapped={false} />}

            {!texture && <meshBasicMaterial color={levelColour(floor.level)} toneMapped={false} />}
          </mesh>
        );
      })}

      {drops.map(drop => {
        const {lip, shadow} = dropStripsOf(drop.facing);

        return (
          <group key={`${drop.x},${drop.y},${drop.facing}`}>
            <mesh position={[drop.x + shadow.x + shadow.width / 2, drop.y + shadow.y + shadow.height / 2, 0.055]}>
              <planeGeometry args={[shadow.width, shadow.height]} />

              <meshBasicMaterial color="#000000" transparent opacity={0.45} />
            </mesh>

            <mesh position={[drop.x + lip.x + lip.width / 2, drop.y + lip.y + lip.height / 2, 0.07]}>
              <planeGeometry args={[lip.width, lip.height]} />

              <meshBasicMaterial color={TERRAIN_EDGE_COLOUR} toneMapped={false} />
            </mesh>
          </group>
        );
      })}

      {stairs.map(stair =>
        stairStripsOf(stair.uphill).map(strip => (
          <mesh
            key={`${stair.x},${stair.y},${strip.x},${strip.y}`}
            position={[stair.x + strip.x + strip.width / 2, stair.y + strip.y + strip.height / 2, 0.06]}
          >
            <planeGeometry args={[strip.width, strip.height]} />

            <meshBasicMaterial
              toneMapped={false}
              color={new Color(levelColour(stair.level)).lerp(new Color(levelColour(stair.level + 1)), strip.fraction)}
            />
          </mesh>
        )),
      )}

      {stairs.map(stair => (
        <StairMarkings key={`${stair.x},${stair.y}`} stair={stair} colour={TERRAIN_EDGE_COLOUR} />
      ))}
    </group>
  );
}

function textureForRaisedFloor(
  level: number,
  middleFloor: CanvasTexture | undefined,
  highestFloor: CanvasTexture | undefined,
): CanvasTexture | undefined {
  if (level >= 2) {
    return highestFloor;
  }

  return middleFloor;
}
