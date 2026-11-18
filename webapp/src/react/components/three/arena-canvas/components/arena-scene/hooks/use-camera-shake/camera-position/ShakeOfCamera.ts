import type {Point} from "@gunsmith/engine/geometry/types/Point";
import type {ReadingRequest} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-camera-shake/camera-position/types/ReadingRequest";

/** How far, in screen pixels (`x` to the right, `y` downwards), the camera where it is has moved the picture from where it is when still: `cameraPositionOf` read the other way. */
export function shakeOfCamera({centre, position, zoom}: ReadingRequest): Point {
  return {x: (centre.x - position.x) * zoom, y: (position.y - centre.y) * zoom};
}
