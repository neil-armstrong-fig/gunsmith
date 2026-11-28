import type {StartingPlaces} from "@gunsmith/engine/arena/symmetry/types/StartingPlaces";
import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import {LiveCanvas} from "@src/react/components/three/arena-preview-canvas/components/live-canvas/LiveCanvas";
import {StillPicture} from "@src/react/components/three/arena-preview-canvas/components/still-picture/StillPicture";
import type {DrawnState} from "@src/react/components/three/arena-preview-canvas/types/DrawnState";
import {useSpritesReady} from "@src/react/sprites/hooks/use-sprites-ready/UseSpritesReady";
import type {JSX} from "react";
import {useState} from "react";

interface Props {
  arena: Arena;
  name: string;
  descriptionId: string | undefined;
  places: StartingPlaces | undefined;
  isScreenshot: boolean;
}

/**
 * The box that shows an arena, named for it, in the arena's own proportions. A single preview is a live canvas; one of a list
 * (`isScreenshot`) is drawn once and kept as a picture, so twenty arenas do not need twenty of the browser's WebGL contexts.
 * `data-pictures-ready` says the arena has been drawn with its pictures.
 */
export function ArenaPreviewCanvas({arena, name, descriptionId, places, isScreenshot}: Props): JSX.Element {
  const picturesReady = useSpritesReady();
  const [created, setCreated] = useState(false);
  const [picture, setPicture] = useState<string | undefined>(undefined);
  const aspect = arena.width / arena.height;

  return (
    <div
      className="relative mx-auto"
      style={{
        width: `min(100%, calc(var(--arena-preview-max-height, 34vh) * ${aspect}))`,
        height: "auto",
        aspectRatio: aspect,
      }}
      role="img"
      aria-label={`${name} arena layout`}
      aria-describedby={descriptionId}
      data-pictures-ready={isDrawn({isScreenshot, created, picturesReady, picture})}
    >
      {!isScreenshot && (
        <LiveCanvas
          arena={arena}
          places={places}
          onCreated={() => {
            setCreated(true);
          }}
        />
      )}

      {isScreenshot && <StillPicture arena={arena} places={places} picture={picture} onDrawn={setPicture} />}
    </div>
  );
}

function isDrawn({isScreenshot, created, picturesReady, picture}: DrawnState): boolean {
  if (isScreenshot) {
    return picture !== undefined;
  }

  return created && picturesReady;
}
