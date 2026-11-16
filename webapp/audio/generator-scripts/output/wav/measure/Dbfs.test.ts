import {expect, it} from "vitest";
import {dbfs} from "@gunsmith/audio-studies/output/wav/measure/Dbfs";

it("is 0 dB at full scale and about -6 dB at half", () => {
  expect(dbfs(1)).toBe(0);
  expect(dbfs(0.5)).toBe(-6.02);
});

it("is -20 dB at a tenth", () => {
  expect(dbfs(0.1)).toBe(-20);
});

it("rounds to two decimal places", () => {
  expect(dbfs(0.3)).toBe(-10.46);
});

it("floors silence at -180 dB rather than minus infinity, so it can be written down", () => {
  expect(dbfs(0)).toBe(-180);
  expect(dbfs(1e-12)).toBe(-180);
});
