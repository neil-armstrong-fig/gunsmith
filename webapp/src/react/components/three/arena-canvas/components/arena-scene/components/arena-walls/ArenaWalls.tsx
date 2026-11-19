import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import {useCoverTiles} from "@src/react/components/three/arena-canvas/components/arena-scene/components/arena-walls/hooks/use-cover-tiles/UseCoverTiles";
import {useWallTiles} from "@src/react/components/three/arena-canvas/components/arena-scene/components/arena-walls/hooks/use-wall-tiles/UseWallTiles";
import {useGroundTexture} from "@src/react/components/three/arena-canvas/components/arena-scene/components/arena-walls/hooks/use-ground-texture/UseGroundTexture";
import {useSprite} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-sprite/UseSprite";
import type {JSX} from "react";

interface Props {
  arena: Arena;
}

/** The ground, full-cell walls and inset low cover blocks beneath the fog. */
export function ArenaWalls({arena}: Props): JSX.Element {
  const wallTiles = useWallTiles(arena);
  const coverTiles = useCoverTiles(arena);
  const groundTexture = useGroundTexture(arena);
  const wallTexture = useSprite("tile-wall");
  const coverTexture = useSprite("tile-low-cover");

  return (
    <group>
      <mesh position={[arena.width / 2, arena.height / 2, 0]}>
        <planeGeometry args={[arena.width, arena.height]} />

        {groundTexture && <meshBasicMaterial map={groundTexture} toneMapped={false} />}

        {!groundTexture && <meshBasicMaterial color="#202b36" toneMapped={false} />}
      </mesh>

      {wallTiles.map(tile => (
        <mesh key={`${tile.x},${tile.y}`} position={[tile.x + 0.5, tile.y + 0.5, 0.5]}>
          <planeGeometry args={[1, 1]} />

          {wallTexture && <meshBasicMaterial map={wallTexture} toneMapped={false} />}

          {!wallTexture && <meshBasicMaterial color="#596572" />}
        </mesh>
      ))}

      {coverTiles.map(tile => (
        <mesh key={`cover-${tile.x},${tile.y}`} position={[tile.x + 0.5, tile.y + 0.5, 0.2]}>
          {coverTexture && (
            <>
              <planeGeometry args={[1, 1]} />

              <meshBasicMaterial map={coverTexture} transparent toneMapped={false} />
            </>
          )}

          {!coverTexture && (
            <>
              <planeGeometry args={[0.8, 0.8]} />

              <meshBasicMaterial color="#8d9cab" toneMapped={false} />
            </>
          )}
        </mesh>
      ))}
    </group>
  );
}
