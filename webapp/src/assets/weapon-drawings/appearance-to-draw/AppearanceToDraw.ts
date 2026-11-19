import type {Appearance} from "@gunsmith/shared/appearance/schema/Appearance";
import {appearanceSchema} from "@gunsmith/shared/appearance/schema/Appearance";
import {fallbackAppearance} from "@gunsmith/shared/appearance/fallback/FallbackAppearance";

/**
 * What the game draws for an appearance it was handed: the appearance itself when the strict schema accepts it, and otherwise the code-owned stand-in. Anything
 * a model produced is `unknown` until this has parsed it, so a refused drawing (an unknown version, a missing or stray field, a part that is not a part) is never drawn.
 */
export function appearanceToDraw(appearance: unknown): Appearance {
  const parsed = appearanceSchema.safeParse(appearance);
  if (parsed.success) {
    return parsed.data;
  }

  return fallbackAppearance();
}
