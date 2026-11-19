import {chooseStartingPlaces} from "@gunsmith/engine/arena-symmetry/ChooseStartingPlaces";
import type {StartingPlaces} from "@gunsmith/engine/arena-symmetry/types/StartingPlaces";
import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import {ArenaPreviewCanvas} from "@src/react/components/three/arena-preview-canvas/ArenaPreviewCanvas";
import type {JSX} from "react";
import {useId, useMemo} from "react";

const EXAMPLE_START_SEED = 17;

interface Props {
  arena: Arena;
  name: string;
  startingPlaces?: StartingPlaces;
}

export function ArenaPreview({arena, name, startingPlaces}: Props): JSX.Element {
  const captionId = useId();
  const examplePlaces = useMemo(() => {
    if (startingPlaces) return undefined;

    return chooseStartingPlaces(arena, EXAMPLE_START_SEED);
  }, [arena, startingPlaces]);
  const places = startingPlaces ?? examplePlaces;

  return (
    <figure>
      <ArenaPreviewCanvas arena={arena} name={name} descriptionId={places && captionId} places={places} />

      {places && (
        <figcaption id={captionId} className="mt-1 text-xs text-gs-ui-muted">
          {startingPlaces && "Starting places"}
          {examplePlaces && "Example starting places"}
        </figcaption>
      )}
    </figure>
  );
}
