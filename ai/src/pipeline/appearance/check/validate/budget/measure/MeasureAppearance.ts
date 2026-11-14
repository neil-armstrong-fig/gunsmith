import type {AppearanceMeasure} from "@gunsmith/ai/pipeline/appearance/check/validate/budget/types/AppearanceMeasure";
import type {Appearance} from "@gunsmith/ai/pipeline/appearance/schema/Appearance";

/** Counts what an appearance costs: its parts, its points and the bytes of its JSON, which `validateAppearance` holds to the limits. */
export function measureAppearance(appearance: Appearance): AppearanceMeasure {
  const points = [...appearance.body, ...appearance.projectile].reduce(
    (total, part) => total + ("points" in part ? part.points.length : 0),
    0,
  );

  return {
    bodyParts: appearance.body.length,
    projectileParts: appearance.projectile.length,
    points,
    bytes: new TextEncoder().encode(JSON.stringify(appearance)).length,
  };
}
