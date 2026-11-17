import {fadedOffset} from "@src/online/prediction/correction/FadedOffset";

it("takes some of the offset away with each step, in the same direction", () => {
  const faded = fadedOffset({x: 0.4, y: -0.2}, 1 / 60);

  expect(faded.x).toBeGreaterThan(0);
  expect(faded.x).toBeLessThan(0.4);
  expect(faded.y).toBeLessThan(0);
  expect(faded.y).toBeGreaterThan(-0.2);
});

it("is mostly gone after a fifth of a second, however it is cut into steps", () => {
  let offset = {x: 0.5, y: 0};
  for (let step = 0; step < 12; step += 1) {
    offset = fadedOffset(offset, 1 / 60);
  }

  expect(offset.x).toBeLessThan(0.1);
  expect(offset.x).toBeCloseTo(fadedOffset({x: 0.5, y: 0}, 0.2).x, 6);
});

it("fades the same share each step, so a larger offset takes the same time to go", () => {
  expect(fadedOffset({x: 0.4, y: 0}, 1 / 60).x / 0.4).toBeCloseTo(fadedOffset({x: 0.1, y: 0}, 1 / 60).x / 0.1, 9);
});

it("leaves no offset as none, and rounds a vanishing one to none", () => {
  expect(fadedOffset({x: 0, y: 0}, 1 / 60)).toEqual({x: 0, y: 0});
  expect(fadedOffset({x: 0.0004, y: -0.0004}, 1 / 60)).toEqual({x: 0, y: 0});
});
