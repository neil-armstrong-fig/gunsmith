import {shakeOffset} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-camera-shake/shake-offset/ShakeOffset";

// Art's study: horizontal = sin(age x 180) x strength x (1 - age / 0.1), vertical = minus half of it, for the first 100 ms only.
const AT = 0.025;

it("does not move the picture at the instant of the hit", () => {
  expect(shakeOffset({age: 0, pixels: 2})).toEqual({x: 0, y: 0});
});

it("moves it horizontally as the study's curve says, damped as the shake ends", () => {
  const {x} = shakeOffset({age: AT, pixels: 2});

  expect(x).toBeCloseTo(Math.sin(AT * 180) * 2 * (1 - AT / 0.1), 10);
});

it("moves it vertically by minus half of the horizontal", () => {
  const {x, y} = shakeOffset({age: AT, pixels: 2});

  expect(y).toBeCloseTo(-x / 2, 10);
});

it("scales with the strength asked for", () => {
  const two = shakeOffset({age: AT, pixels: 2});
  const six = shakeOffset({age: AT, pixels: 6});

  expect(six.x).toBeCloseTo(three(two.x), 10);
  expect(six.y).toBeCloseTo(three(two.y), 10);
});

it("is exactly still from 100 ms on, though the curve there is not quite zero", () => {
  expect(shakeOffset({age: 0.1, pixels: 2})).toEqual({x: 0, y: 0});
  expect(shakeOffset({age: 0.5, pixels: 2})).toEqual({x: 0, y: 0});
  expect(shakeOffset({age: Number.POSITIVE_INFINITY, pixels: 2})).toEqual({x: 0, y: 0});
});

it("is exactly still at zero strength, which is how the shake is turned off", () => {
  expect(shakeOffset({age: AT, pixels: 0})).toEqual({x: 0, y: 0});
});

function three(value: number): number {
  return value * 3;
}
