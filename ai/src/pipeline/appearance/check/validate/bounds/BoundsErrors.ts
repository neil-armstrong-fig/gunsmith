import type {Appearance} from "@gunsmith/ai/pipeline/appearance/schema/Appearance";
import {outsideErrors} from "@gunsmith/ai/pipeline/appearance/check/validate/bounds/outside/OutsideErrors";

/** Names each part, in the body or the projectile, that reaches outside the design space once it is turned and stroked. */
export function boundsErrors(appearance: Appearance): string[] {
  return [...outsideErrors("body", appearance.body), ...outsideErrors("projectile", appearance.projectile)];
}
