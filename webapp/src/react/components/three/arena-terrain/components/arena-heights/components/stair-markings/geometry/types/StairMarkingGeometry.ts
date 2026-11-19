import type {StairMarking} from "@src/react/components/three/arena-terrain/components/arena-heights/components/stair-markings/geometry/types/StairMarking";

export interface StairMarkingGeometry {
  treads: StairMarking[];
  rails: StairMarking[];
}
