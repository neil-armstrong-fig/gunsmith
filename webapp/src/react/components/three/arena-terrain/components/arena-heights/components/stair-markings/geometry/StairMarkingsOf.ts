import {uphillStep} from "@gunsmith/engine/arena/drawing/stairs/UphillStep";
import type {Uphill} from "@gunsmith/engine/arena/types/Uphill";
import type {Point} from "@gunsmith/engine/geometry/types/Point";
import type {StairMarking} from "@src/react/components/three/arena-terrain/components/arena-heights/components/stair-markings/geometry/types/StairMarking";
import type {StairMarkingGeometry} from "@src/react/components/three/arena-terrain/components/arena-heights/components/stair-markings/geometry/types/StairMarkingGeometry";

const PIXELS_PER_TILE = 64;
const STROKE = 2;
const RAIL_OFFSET = 27;
const LANDING_REACH = 16;
// Odd pixel centres keep the two-pixel marks centred on a full pixel at 32 px per tile.
const TREAD_CENTRES = [-15, 1, 17];

export function stairMarkingsOf(uphill: Uphill): StairMarkingGeometry {
  const step = uphillStep(uphill);

  return {
    treads: TREAD_CENTRES.map(x => {
      return markingInTiles(step, {x, y: 0, width: STROKE, height: 2 * RAIL_OFFSET});
    }),
    rails: [-RAIL_OFFSET, RAIL_OFFSET].map(y => {
      return markingInTiles(step, {x: 0, y, width: PIXELS_PER_TILE + 2 * LANDING_REACH, height: STROKE});
    }),
  };
}

/** Turn an east-facing rectangle to follow the stair, then convert design pixels to tiles. */
function markingInTiles(step: Point, {x, y, width, height}: StairMarking): StairMarking {
  return {
    x: (step.x * x - step.y * y) / PIXELS_PER_TILE,
    y: (step.y * x + step.x * y) / PIXELS_PER_TILE,
    width: (Math.abs(step.x) * width + Math.abs(step.y) * height) / PIXELS_PER_TILE,
    height: (Math.abs(step.y) * width + Math.abs(step.x) * height) / PIXELS_PER_TILE,
  };
}
