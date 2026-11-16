import type {RaisedFloor} from "@src/react/components/three/arena-canvas/components/arena-scene/components/arena-heights/hooks/use-height-tiles/tiles/types/types/RaisedFloor";
import type {StairTile} from "@src/react/components/three/arena-canvas/components/arena-scene/components/arena-heights/hooks/use-height-tiles/tiles/types/types/StairTile";
import type {DropEdge} from "@src/react/components/three/arena-canvas/components/arena-scene/components/arena-heights/hooks/use-height-tiles/tiles/types/types/DropEdge";

/** Everything in an arena that is not the low ground and not a wall. */
export interface HeightTiles {
  floors: RaisedFloor[];
  stairs: StairTile[];
  drops: DropEdge[];
}
