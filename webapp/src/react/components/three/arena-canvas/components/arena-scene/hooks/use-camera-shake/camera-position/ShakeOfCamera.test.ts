import {cameraPositionOf} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-camera-shake/camera-position/CameraPositionOf";
import {shakeOfCamera} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-camera-shake/camera-position/ShakeOfCamera";

const CENTRE = {x: 10, y: 6};

it("reads no shake from a camera at the centre", () => {
  expect(shakeOfCamera({centre: CENTRE, position: CENTRE, zoom: 40})).toEqual({x: 0, y: 0});
});

it("reads a camera moved left as a picture moved right, and a camera moved north as a picture moved down", () => {
  const {x, y} = shakeOfCamera({centre: CENTRE, position: {x: 10 - 0.05, y: 6 + 0.025}, zoom: 40});

  expect(x).toBeCloseTo(2, 10);
  expect(y).toBeCloseTo(1, 10);
});

it("gives back the shake a camera position was worked out from", () => {
  const shake = {x: -1.3, y: 0.65};
  const position = cameraPositionOf({centre: CENTRE, shake, zoom: 37});
  const read = shakeOfCamera({centre: CENTRE, position, zoom: 37});

  expect(read.x).toBeCloseTo(shake.x, 10);
  expect(read.y).toBeCloseTo(shake.y, 10);
});
