import type {DropFacing} from "@src/react/components/three/arena-canvas/components/arena-scene/components/arena-heights/drops/types/DropFacing";
import type {DropStrips} from "@src/react/components/three/arena-canvas/components/arena-scene/components/arena-heights/drops/types/DropStrips";

/** How thick the bright lip is, inside the raised tile's edge, in tiles. */
const LIP = 0.1;
/** How far the shadow reaches out over the lower ground, in tiles. */
const SHADOW = 0.3;

/** The lip and the shadow of a raised tile that drops away to the `facing` side, so the edge reads as a cliff from above. */
export function dropStripsOf(facing: DropFacing): DropStrips {
  if (facing === "west") {
    return {lip: {x: 0, y: 0, width: LIP, height: 1}, shadow: {x: -SHADOW, y: 0, width: SHADOW, height: 1}};
  }

  if (facing === "east") {
    return {lip: {x: 1 - LIP, y: 0, width: LIP, height: 1}, shadow: {x: 1, y: 0, width: SHADOW, height: 1}};
  }

  if (facing === "south") {
    return {lip: {x: 0, y: 0, width: 1, height: LIP}, shadow: {x: 0, y: -SHADOW, width: 1, height: SHADOW}};
  }

  return {lip: {x: 0, y: 1 - LIP, width: 1, height: LIP}, shadow: {x: 0, y: 1, width: 1, height: SHADOW}};
}
