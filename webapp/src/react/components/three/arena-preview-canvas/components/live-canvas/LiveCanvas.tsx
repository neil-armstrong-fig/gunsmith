import type {StartingPlaces} from "@gunsmith/engine/arena-symmetry/types/StartingPlaces";
import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import {Canvas} from "@react-three/fiber";
import {CapturePicture} from "@src/react/components/three/arena-preview-canvas/components/live-canvas/components/capture-picture/CapturePicture";
import {StartingPlace} from "@src/react/components/three/arena-preview-canvas/components/live-canvas/components/starting-place/StartingPlace";
import {ArenaTerrain} from "@src/react/components/three/arena-terrain/ArenaTerrain";
import type {JSX} from "react";

interface Props {
  arena: Arena;
  places: StartingPlaces | undefined;
  onCreated?: () => void;
  onDrawn?: (picture: string) => void;
}

/** The arena drawn by the real terrain components, filling the box it is put in, its tile bounds mapped straight onto the canvas. */
export function LiveCanvas({arena, places, onCreated, onDrawn}: Props): JSX.Element {
  const halfWidth = arena.width / 2;
  const halfHeight = arena.height / 2;

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
      className="absolute! inset-0 rounded-sm"
      onCreated={() => {
        onCreated?.();
      }}
    >
      <ArenaTerrain arena={arena} />

      {places && (
        <>
          <StartingPlace point={places.player} />

          <StartingPlace point={places.opponent} />
        </>
      )}

      {onDrawn && <CapturePicture onDrawn={onDrawn} />}
    </Canvas>
  );
}
