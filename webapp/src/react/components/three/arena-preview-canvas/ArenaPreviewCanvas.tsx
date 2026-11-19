import type {StartingPlaces} from "@gunsmith/engine/arena-symmetry/types/StartingPlaces";
import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import {Canvas} from "@react-three/fiber";
import {StartingPlace} from "@src/react/components/three/arena-preview-canvas/components/starting-place/StartingPlace";
import {ArenaTerrain} from "@src/react/components/three/arena-terrain/ArenaTerrain";
import {useSpritesReady} from "@src/react/sprites/hooks/use-sprites-ready/UseSpritesReady";
import type {JSX} from "react";
import {useState} from "react";

interface Props {
  arena: Arena;
  name: string;
  descriptionId: string | undefined;
  places: StartingPlaces | undefined;
}

/** Maps the arena's tile bounds directly to a canvas with the same aspect ratio. */
export function ArenaPreviewCanvas({arena, name, descriptionId, places}: Props): JSX.Element {
  const picturesReady = useSpritesReady();
  const [ready, setReady] = useState(false);
  const halfWidth = arena.width / 2;
  const halfHeight = arena.height / 2;
  const aspect = arena.width / arena.height;

  return (
    <Canvas
      orthographic
      frameloop="demand"
      camera={{
        position: [halfWidth, halfHeight, 10],
        rotation: [0, 0, 0],
        left: -halfWidth,
        right: halfWidth,
        top: halfHeight,
        bottom: -halfHeight,
      }}
      className="mx-auto rounded-sm"
      style={{
        width: `min(100%, calc(var(--arena-preview-max-height, 34vh) * ${aspect}))`,
        height: "auto",
        aspectRatio: aspect,
      }}
      role="img"
      aria-label={`${name} arena layout`}
      aria-describedby={descriptionId}
      data-pictures-ready={ready && picturesReady}
      onCreated={() => {
        setReady(true);
      }}
    >
      <ArenaTerrain arena={arena} />

      {places && (
        <>
          <StartingPlace point={places.player} />

          <StartingPlace point={places.opponent} />
        </>
      )}
    </Canvas>
  );
}
