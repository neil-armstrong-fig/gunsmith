import type {DropFacing} from "@src/react/components/three/arena-terrain/components/arena-heights/drops/types/DropFacing";

/** The edge of a raised tile that drops to lower ground: the tile, and the side it drops away on. */
export interface DropEdge {
  x: number;
  y: number;
  facing: DropFacing;
}
