import {partExtent} from "@gunsmith/ai/pipeline/appearance/check/validate/bounds/extent/PartExtent";
import {fallbackAppearance} from "@gunsmith/shared/appearance/fallback/FallbackAppearance";
import {validateAppearance} from "@gunsmith/ai/pipeline/appearance/check/validate/ValidateAppearance";

it("is an appearance that passes every rule a generated one must pass", () => {
  expect(validateAppearance(fallbackAppearance())).toEqual({ok: true, appearance: fallbackAppearance()});
});

it("is a body that can be seen: one part long enough to read as a weapon, and every part drawn", () => {
  const body = fallbackAppearance().body;
  const longestPart = Math.max(...body.map(part => partExtent(part).maxX - partExtent(part).minX));

  expect(longestPart).toBeGreaterThanOrEqual(30);
  expect(body.every(part => part.fill !== "none" || part.stroke !== "none")).toBe(true);
});

it("is a fresh copy each time, so one caller cannot change what the next gets", () => {
  const first = fallbackAppearance();
  first.body.length = 0;

  expect(fallbackAppearance().body.length).toBeGreaterThan(0);
});
