import type {RaisedFloor} from "@src/react/components/three/arena-terrain/components/arena-heights/hooks/use-height-tiles/tiles/types/RaisedFloor";
import type {StairTile} from "@src/react/components/three/arena-terrain/components/arena-heights/hooks/use-height-tiles/tiles/types/StairTile";
import type {DropEdge} from "@src/react/components/three/arena-terrain/components/arena-heights/hooks/use-height-tiles/tiles/types/DropEdge";

/** Everything in an arena that is not the low ground and not a wall. */
export interface HeightTiles {
  floors: RaisedFloor[];
  stairs: StairTile[];
  drops: DropEdge[];
}
