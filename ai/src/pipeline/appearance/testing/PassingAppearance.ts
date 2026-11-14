/**
 * A small appearance that is valid by every rule (a grey body block, one accent circle and a muzzle), as plain data a test can
 * copy and break one thing in. Typed loosely on purpose: a test breaks it with values the strict type would refuse.
 * Test-only.
 */
export function passingAppearance(): Record<string, unknown> {
  return {
    version: 1,
    palette: {accent: "weapon-blue", "accent-secondary": "weapon-orange"},
    body: [
      {
        kind: "rect",
        x: 12,
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
        kind: "circle",
        x: 28,
        y: 32,
        radius: 6,
        fill: "accent",
        stroke: "outline",
        strokeWidth: 2,
        opacity: 1,
        rotation: 0,
        detail: "structural",
      },
      {
        kind: "polygon",
        x: 0,
        y: 0,
        points: [
          [50, 27],
          [60, 30],
          [60, 34],
          [50, 37],
        ],
        fill: "accent-secondary",
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
