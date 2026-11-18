import type {Point} from "@gunsmith/engine/geometry/types/Point";
import type {CameraRequest} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-camera-shake/camera-position/types/CameraRequest";

/**
 * Where to put the camera, in tiles, so that the picture moves by `shake` screen pixels. The picture moves the way the camera does not: a camera moved to the
 * left shows the picture moved to the right, and the arena's `y` grows north where the screen's grows down, so a picture moved down is a camera moved north.
 */
export function cameraPositionOf({centre, shake, zoom}: CameraRequest): Point {
  return {x: centre.x - shake.x / zoom, y: centre.y + shake.y / zoom};
}
