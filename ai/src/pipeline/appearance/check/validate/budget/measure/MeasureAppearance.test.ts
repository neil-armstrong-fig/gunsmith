import {appearanceSchema} from "@gunsmith/shared/appearance/schema/Appearance";
import {measureAppearance} from "@gunsmith/ai/pipeline/appearance/check/validate/budget/measure/MeasureAppearance";
import {passingAppearance} from "@gunsmith/ai/pipeline/appearance/testing/PassingAppearance";

it("counts the parts of the body and of the projectile separately", () => {
  const appearance = appearanceSchema.parse(passingAppearance());

  expect(measureAppearance(appearance)).toMatchObject({bodyParts: 3, projectileParts: 0});
});

it("counts the points of every polygon and polyline, in the body and in the projectile", () => {
  const source = passingAppearance();
  const bodyPolygon = (source.body as Record<string, unknown>[])[2];
  const appearance = appearanceSchema.parse({
    ...source,
    projectile: [{...bodyPolygon, kind: "polyline", fill: "none"}],
  });

  expect(measureAppearance(appearance)).toMatchObject({points: 8, projectileParts: 1});
});

it("counts the bytes of the compact JSON a model would write", () => {
  const appearance = appearanceSchema.parse(passingAppearance());

  expect(measureAppearance(appearance).bytes).toBe(JSON.stringify(appearance).length);
});
