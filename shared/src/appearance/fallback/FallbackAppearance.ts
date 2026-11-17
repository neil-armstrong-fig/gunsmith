import type {Appearance} from "@gunsmith/shared/appearance/schema/Appearance";

/**
 * The safe visual a weapon gets when its generated appearance cannot be made valid: a plain, readable, right-facing body block
 * with a muzzle, in neutral roles. A fresh copy each call. Cosmetic only (it never touches a stat), and the caller must say it
 * is a substitute at the reveal. DRAFT: the look is a placeholder for `art` to replace; what matters here is that it passes
 * `validateAppearance` and cannot be invisible.
 */
export function fallbackAppearance(): Appearance {
  return {
    version: 1,
    palette: {accent: "weapon-blue", "accent-secondary": "weapon-orange"},
    body: [
      {
        kind: "rect",
        x: 8,
        y: 26,
        width: 40,
        height: 12,
        fill: "body",
        stroke: "outline",
        strokeWidth: 2,
        opacity: 1,
        rotation: 0,
        detail: "structural",
      },
      {
        kind: "rect",
        x: 48,
        y: 29,
        width: 12,
        height: 6,
        fill: "accent",
        stroke: "outline",
        strokeWidth: 2,
        opacity: 1,
        rotation: 0,
        detail: "structural",
      },
    ],
    projectile: [],
    impact: {preset: "spark", colour: "accent"},
    animation: {preset: "none"},
  };
}
