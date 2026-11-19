import type {DropFacing} from "@src/react/components/three/arena-terrain/components/arena-heights/drops/types/DropFacing";
import type {DropStrips} from "@src/react/components/three/arena-terrain/components/arena-heights/drops/types/DropStrips";

/** The lip and the shadow of a raised tile that drops away to the `facing` side, so the edge reads as a cliff from above. */
export function dropStripsOf(facing: DropFacing): DropStrips {
  const lip = 4 / 64;
  const shadow = 12 / 64;

  if (facing === "west") {
    return {lip: {x: 0, y: 0, width: lip, height: 1}, shadow: {x: -shadow, y: 0, width: shadow, height: 1}};
  }

  if (facing === "east") {
    return {lip: {x: 1 - lip, y: 0, width: lip, height: 1}, shadow: {x: 1, y: 0, width: shadow, height: 1}};
  }

  if (facing === "south") {
    return {lip: {x: 0, y: 0, width: 1, height: lip}, shadow: {x: 0, y: -shadow, width: 1, height: shadow}};
  }

  return {lip: {x: 0, y: 1 - lip, width: 1, height: lip}, shadow: {x: 0, y: 1, width: 1, height: shadow}};
}
