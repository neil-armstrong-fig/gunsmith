import {cameraPositionOf} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-camera-shake/camera-position/CameraPositionOf";

const CENTRE = {x: 10, y: 6};

it("leaves the camera at the centre when nothing shakes it", () => {
  expect(cameraPositionOf({centre: CENTRE, shake: {x: 0, y: 0}, zoom: 40})).toEqual(CENTRE);
});

it("moves the camera left to show the picture moved right, by the pixels over the tile's pixels", () => {
  expect(cameraPositionOf({centre: CENTRE, shake: {x: 2, y: 0}, zoom: 40})).toEqual({x: 10 - 2 / 40, y: 6});
});

it("moves the camera north to show the picture moved down, as the screen's y grows down and the arena's grows north", () => {
  expect(cameraPositionOf({centre: CENTRE, shake: {x: 0, y: 2}, zoom: 40})).toEqual({x: 10, y: 6 + 2 / 40});
});

it("moves the camera less, in tiles, the more pixels a tile has", () => {
  const near = cameraPositionOf({centre: CENTRE, shake: {x: 2, y: 0}, zoom: 20});
  const far = cameraPositionOf({centre: CENTRE, shake: {x: 2, y: 0}, zoom: 80});

  expect(CENTRE.x - near.x).toBeCloseTo(4 * (CENTRE.x - far.x), 10);
});
