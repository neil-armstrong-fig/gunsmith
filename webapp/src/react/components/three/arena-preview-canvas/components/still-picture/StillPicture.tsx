import type {StartingPlaces} from "@gunsmith/engine/arena/symmetry/types/StartingPlaces";
import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import {useTurnToDraw} from "@src/react/components/three/arena-preview-canvas/components/still-picture/hooks/use-turn-to-draw/UseTurnToDraw";
import {LiveCanvas} from "@src/react/components/three/arena-preview-canvas/components/live-canvas/LiveCanvas";
import type {JSX} from "react";

interface Props {
  arena: Arena;
  places: StartingPlaces | undefined;
  picture: string | undefined;
  onDrawn: (picture: string) => void;
}

/**
 * The arena as a picture: drawn once by the real components in a canvas of its own when its turn comes (`useTurnToDraw`), kept as an
 * image, and the canvas let go, so a list of arenas holds a browser's WebGL contexts only while it is being drawn.
 */
export function StillPicture({arena, places, picture, onDrawn}: Props): JSX.Element {
  const turn = useTurnToDraw(picture !== undefined);

  return (
    <>
      {picture && <img src={picture} alt="" className="absolute inset-0 h-full w-full rounded-sm" />}

      {turn && <LiveCanvas arena={arena} places={places} onDrawn={onDrawn} />}
    </>
  );
}
