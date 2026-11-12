import {directionFromKeys} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-game-loop/hooks/use-wasd-movement/keys/DirectionFromKeys";

it("stands still when no key is held", () => {
  expect(directionFromKeys(new Set())).toEqual({x: 0, y: 0});
});

it("moves up the screen on W and down on S", () => {
  expect(directionFromKeys(new Set(["KeyW"]))).toEqual({x: 0, y: 1});
  expect(directionFromKeys(new Set(["KeyS"]))).toEqual({x: 0, y: -1});
});

it("moves right on D and left on A", () => {
  expect(directionFromKeys(new Set(["KeyD"]))).toEqual({x: 1, y: 0});
  expect(directionFromKeys(new Set(["KeyA"]))).toEqual({x: -1, y: 0});
});

it("is no faster on a diagonal", () => {
  const direction = directionFromKeys(new Set(["KeyW", "KeyD"]));

  expect(Math.hypot(direction.x, direction.y)).toBeCloseTo(1);
  expect(direction.x).toBeGreaterThan(0);
  expect(direction.y).toBeGreaterThan(0);
});

it("cancels out opposing keys", () => {
  expect(directionFromKeys(new Set(["KeyW", "KeyS"]))).toEqual({x: 0, y: 0});
  expect(directionFromKeys(new Set(["KeyA", "KeyD", "KeyW"]))).toEqual({x: 0, y: 1});
});

it("ignores keys that are not movement keys", () => {
  expect(directionFromKeys(new Set(["Space", "KeyQ"]))).toEqual({x: 0, y: 0});
});
