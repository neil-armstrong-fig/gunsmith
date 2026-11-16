import {numberFromParameter} from "@src/game/scenario/ring-timing/number/NumberFromParameter";

it("reads whole and fractional numbers", () => {
  expect(numberFromParameter("?a=3", "a")).toBe(3);
  expect(numberFromParameter("?a=1.5", "a")).toBe(1.5);
  expect(numberFromParameter("?a=0", "a")).toBe(0);
});

it("finds the parameter by name among others", () => {
  expect(numberFromParameter("?b=1&a=2&c=3", "a")).toBe(2);
});

it("has nothing for a missing parameter", () => {
  expect(numberFromParameter("", "a")).toBeUndefined();
  expect(numberFromParameter("?b=1", "a")).toBeUndefined();
});

it("has nothing for anything but a plain number", () => {
  for (const asked of ["", "abc", "-1", "+1", "1e3", ".5", "1.", "1,5", "1 2", "Infinity", "NaN", "12abc"]) {
    expect(numberFromParameter(`?a=${encodeURIComponent(asked)}`, "a")).toBeUndefined();
  }
});
