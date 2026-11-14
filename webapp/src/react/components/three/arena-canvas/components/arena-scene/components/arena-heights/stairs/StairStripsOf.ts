import type {Uphill} from "@gunsmith/engine/arena/types/Uphill";
import type {StairStrip} from "@src/react/components/three/arena-canvas/components/arena-scene/components/arena-heights/stairs/types/StairStrip";

const STRIP_COUNT = 4;

/**
 * The bands a stair's flight is drawn as, nearest the low end first: across the tile, each a quarter of the way, shaded
 * from the low floor's colour to the high floor's by `fraction`. It reads as steps without a label.
 */
export function stairStripsOf(uphill: Uphill): StairStrip[] {
  const strips: StairStrip[] = [];
  const size = 1 / STRIP_COUNT;

  for (let index = 0; index < STRIP_COUNT; index += 1) {
    const fraction = (index + 0.5) * size;
    const along = index * size;

    strips.push(stripAt(uphill, along, size, fraction));
  }

  return strips;
}

/** The band that starts `along` the flight from its low end, `size` long, climbing `uphill`. */
function stripAt(uphill: Uphill, along: number, size: number, fraction: number): StairStrip {
  if (uphill === "east") {
    return {x: along, y: 0, width: size, height: 1, fraction};
  }

  if (uphill === "west") {
    return {x: 1 - along - size, y: 0, width: size, height: 1, fraction};
  }

  if (uphill === "north") {
    return {x: 0, y: along, width: 1, height: size, fraction};
  }

  return {x: 0, y: 1 - along - size, width: 1, height: size, fraction};
}
