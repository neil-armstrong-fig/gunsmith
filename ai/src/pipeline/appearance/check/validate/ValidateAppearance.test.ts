import {validateAppearance} from "@gunsmith/ai/pipeline/appearance/check/validate/ValidateAppearance";
import {readArtAppearanceFixtures} from "@gunsmith/ai/pipeline/appearance/testing/ArtAppearanceFixtures";
import {passingAppearance} from "@gunsmith/ai/pipeline/appearance/testing/PassingAppearance";

/** The passing appearance with one body part changed. */
function withBodyPart(index: number, change: Record<string, unknown>): unknown {
  const appearance = passingAppearance();
  const body = appearance.body as Record<string, unknown>[];
  body[index] = {...body[index], ...change};

  return appearance;
}

/** A closed shape of `count` points on a small ring, so it stays inside the space whatever the count. */
function ring(count: number, centreX: number, centreY: number, decimals?: number): number[][] {
  return Array.from({length: count}, (_, index) => {
    const angle = (index / count) * 2 * Math.PI;
    const x = centreX + 3 * Math.cos(angle);
    const y = centreY + 3 * Math.sin(angle);

    return decimals === undefined ? [x, y] : [Number(x.toFixed(decimals)), Number(y.toFixed(decimals))];
  });
}

function polygonOf(points: number[][]): Record<string, unknown> {
  return {
    kind: "polygon",
    x: 0,
    y: 0,
    points,
    fill: "accent",
    stroke: "outline",
    strokeWidth: 2,
    opacity: 1,
    rotation: 0,
    detail: "structural",
  };
}

function errorsOf(candidate: unknown): string[] {
  const result = validateAppearance(candidate);

  return result.ok ? [] : result.errors;
}

it("accepts every appearance art has drawn", () => {
  const fixtures = readArtAppearanceFixtures();
  const refused = fixtures.flatMap(fixture => errorsOf(fixture.appearance).map(error => `${fixture.name}: ${error}`));

  expect(fixtures.length).toBeGreaterThanOrEqual(18);
  expect(refused).toEqual([]);
});

it("returns the appearance, parsed, when the answer fits", () => {
  const result = validateAppearance(passingAppearance());

  expect(result).toEqual({ok: true, appearance: passingAppearance()});
});

it.each([
  ["a version it does not know", {...passingAppearance(), version: 2}, "version:"],
  ["a field it does not have", {...passingAppearance(), glow: 5}, 'appearance: Unrecognized key: "glow"'],
  ["no body", {...passingAppearance(), body: []}, "body:"],
  ["a part kind it does not know", withBodyPart(0, {kind: "star"}), "body.0.kind:"],
  ["a stray field on a part", withBodyPart(0, {glow: 1}), 'body.0: Unrecognized key: "glow"'],
  ["a colour role it does not know", withBodyPart(0, {fill: "red"}), "body.0.fill:"],
  ["a stroke colour role it does not know", withBodyPart(0, {stroke: "#ff0000"}), "body.0.stroke:"],
  [
    "a palette token it does not know",
    {...passingAppearance(), palette: {accent: "weapon-red", "accent-secondary": "weapon-blue"}},
    "palette.accent:",
  ],
  ["a number that is not a number", withBodyPart(1, {x: Number.NaN}), "body.1.x:"],
  ["a number that is infinite", withBodyPart(1, {y: Number.POSITIVE_INFINITY}), "body.1.y:"],
  ["a number written as text", withBodyPart(1, {radius: "6"}), "body.1.radius:"],
  ["a stroke wider than allowed", withBodyPart(0, {strokeWidth: 4.5}), "body.0.strokeWidth:"],
  ["a stroke of negative width", withBodyPart(0, {strokeWidth: -1}), "body.0.strokeWidth:"],
  ["an opacity above one", withBodyPart(0, {opacity: 1.5}), "body.0.opacity:"],
  ["an opacity so low the part all but vanishes", withBodyPart(0, {opacity: 0.1}), "body.0.opacity:"],
  ["a rotation beyond half a turn", withBodyPart(0, {rotation: 181}), "body.0.rotation:"],
  ["a rotation beyond half a turn the other way", withBodyPart(0, {rotation: -181}), "body.0.rotation:"],
  [
    "a stray field in the palette",
    {...passingAppearance(), palette: {accent: "weapon-blue", "accent-secondary": "weapon-blue", third: "weapon-pink"}},
    "palette: Unrecognized key",
  ],
  [
    "a stray field in the impact",
    {...passingAppearance(), impact: {preset: "spark", colour: "accent", radius: 40}},
    "impact: Unrecognized key",
  ],
  [
    "a stray field in the animation",
    {...passingAppearance(), animation: {preset: "none", speed: 9}},
    "animation: Unrecognized key",
  ],
  [
    "a polygon of two points",
    withBodyPart(2, {
      points: [
        [50, 27],
        [60, 30],
      ],
    }),
    "body.2.points:",
  ],
  ["a polyline of one point", withBodyPart(2, {kind: "polyline", points: [[50, 27]]}), "body.2.points:"],
  ["a point that is not a pair", withBodyPart(2, {points: [[50, 27], [60], [55, 40]]}), "body.2.points.1:"],
  ["a detail tier it does not know", withBodyPart(0, {detail: "tiny"}), "body.0.detail:"],
  ["a part with no x", withBodyPart(1, {x: undefined}), "body.1.x:"],
  ["a part with no y", withBodyPart(1, {y: undefined}), "body.1.y:"],
  [
    "an impact colour it does not know",
    {...passingAppearance(), impact: {preset: "spark", colour: "pink"}},
    "impact.colour:",
  ],
  [
    "a second accent it does not know",
    {...passingAppearance(), palette: {accent: "weapon-blue", "accent-secondary": "weapon-red"}},
    "palette.accent-secondary:",
  ],
  ["a circle with no radius", withBodyPart(1, {radius: undefined}), "body.1.radius:"],
  ["a circle with a zero radius", withBodyPart(1, {radius: 0}), "body.1.radius:"],
  [
    "an impact it does not know",
    {...passingAppearance(), impact: {preset: "nuke", colour: "accent"}},
    "impact.preset:",
  ],
  ["an animation it does not know", {...passingAppearance(), animation: {preset: "strobe"}}, "animation.preset:"],
  ["nothing at all", undefined, "appearance: Invalid input: expected object, received undefined"],
  ["text instead of an object", "a rifle", "appearance: Invalid input: expected object, received string"],
])("refuses %s, and says where", (_description, candidate, expectedError) => {
  expect(errorsOf(candidate)).toEqual(expect.arrayContaining([expect.stringContaining(expectedError)]));
});

it.each([
  ["the widest stroke", withBodyPart(0, {strokeWidth: 4})],
  ["no stroke width", withBodyPart(0, {strokeWidth: 0})],
  ["the faintest opacity", withBodyPart(0, {opacity: 0.2})],
  ["full opacity", withBodyPart(0, {opacity: 1})],
  ["half a turn one way", withBodyPart(1, {rotation: 180})],
  ["half a turn the other way", withBodyPart(1, {rotation: -180})],
  ["every animation preset the renderer knows", {...passingAppearance(), animation: {preset: "recoil"}}],
  [
    "every impact preset the renderer knows",
    {...passingAppearance(), impact: {preset: "pop", colour: "accent-secondary"}},
  ],
])("accepts %s", (_description, candidate) => {
  expect(errorsOf(candidate)).toEqual([]);
});

it.each([
  ["a circle", {kind: "circle", radius: 5}],
  ["an ellipse", {kind: "ellipse", radiusX: 8, radiusY: 4}],
  ["a rectangle", {kind: "rect", width: 8, height: 4}],
  [
    "a polygon",
    {
      kind: "polygon",
      points: [
        [10, 10],
        [20, 10],
        [15, 20],
      ],
    },
  ],
  [
    "a polyline",
    {
      kind: "polyline",
      points: [
        [10, 10],
        [20, 20],
      ],
    },
  ],
])("takes %s with its own geometry and refuses a field it does not have", (_kind, geometry) => {
  const part = {
    x: 30,
    y: 30,
    fill: "accent",
    stroke: "outline",
    strokeWidth: 2,
    opacity: 1,
    rotation: 0,
    detail: "structural",
    ...geometry,
  };
  const appearance = passingAppearance();

  appearance.body = [part];
  expect(errorsOf(appearance)).toEqual([]);

  appearance.body = [{...part, glow: 1}];
  expect(errorsOf(appearance)).toEqual(['body.0: Unrecognized key: "glow"']);
});

it("says a turned-out edge to two decimals, so floating-point noise does not fill the sentence", () => {
  expect(errorsOf(withBodyPart(1, {x: 60.3, radius: 5.1}))).toEqual([expect.stringContaining("(right edge 66.4)")]);
});

it("refuses more body parts than allowed", () => {
  const appearance = passingAppearance();
  appearance.body = Array.from({length: 25}, () => polygonOf(ring(3, 32, 32)));

  expect(errorsOf(appearance)).toEqual([expect.stringContaining("body:")]);
});

it("accepts exactly the most body parts allowed", () => {
  const appearance = passingAppearance();
  appearance.body = Array.from({length: 24}, () => polygonOf(ring(3, 32, 32)));

  expect(errorsOf(appearance)).toEqual([]);
});

it("accepts exactly the most projectile parts allowed", () => {
  const appearance = passingAppearance();
  appearance.projectile = Array.from({length: 8}, () => polygonOf(ring(3, 32, 32)));

  expect(errorsOf(appearance)).toEqual([]);
});

it("refuses more projectile parts than allowed", () => {
  const appearance = passingAppearance();
  appearance.projectile = Array.from({length: 9}, () => polygonOf(ring(3, 32, 32)));

  expect(errorsOf(appearance)).toEqual([expect.stringContaining("projectile:")]);
});

it("refuses more points in one part than allowed, and accepts the most allowed", () => {
  expect(errorsOf(withBodyPart(2, {points: ring(33, 32, 32)}))).toEqual([expect.stringContaining("body.2.points:")]);
  expect(errorsOf(withBodyPart(2, {points: ring(32, 32, 32)}))).toEqual([]);
});

it("refuses more points in all than allowed, and says how many", () => {
  const appearance = passingAppearance();
  appearance.body = Array.from({length: 13}, () => polygonOf(ring(30, 32, 32, 1)));

  expect(errorsOf(appearance)).toEqual(["appearance: 390 points in all, over the limit of 384"]);
});

it("accepts exactly the most points in all that are allowed", () => {
  const appearance = passingAppearance();
  appearance.body = Array.from({length: 12}, () => polygonOf(ring(32, 32, 32, 1)));

  expect(errorsOf(appearance)).toEqual([]);
});

it("refuses more bytes than allowed, and says how many", () => {
  const appearance = passingAppearance();
  appearance.body = Array.from({length: 12}, () => polygonOf(ring(32, 32, 32, 12)));

  expect(errorsOf(appearance)).toEqual([expect.stringMatching(/^appearance: \d+ bytes, over the limit of 12288$/)]);
});

it("refuses a part that sticks out of the space, and names the part", () => {
  const errors = errorsOf(withBodyPart(0, {x: 60, width: 10}));

  expect(errors).toEqual(["body.0: reaches outside the 64 by 64 space (right edge 71)"]);
});

it("refuses a part whose stroke is what pushes it out", () => {
  expect(errorsOf(withBodyPart(1, {x: 62, radius: 2}))).toEqual([expect.stringContaining("body.1: reaches outside")]);
});

it("accepts a part whose stroke reaches the very edge of the space", () => {
  expect(errorsOf(withBodyPart(1, {x: 61, radius: 2}))).toEqual([]);
});

it("accepts a part at the edge when the stroke that would push it out is not drawn", () => {
  expect(errorsOf(withBodyPart(1, {x: 62, radius: 2, stroke: "none", strokeWidth: 4}))).toEqual([]);
});

it.each([
  ["left", withBodyPart(1, {x: 2, radius: 6}), "body.1: reaches outside the 64 by 64 space (left edge -5)"],
  ["top", withBodyPart(1, {y: 2, radius: 6}), "body.1: reaches outside the 64 by 64 space (top edge -5)"],
  ["bottom", withBodyPart(1, {y: 60, radius: 6}), "body.1: reaches outside the 64 by 64 space (bottom edge 67)"],
  ["left, when it crosses the top too", withBodyPart(1, {x: 2, y: 2, radius: 6}), "(left edge -5)"],
])("names the %s edge a part crosses", (_edge, candidate, expectedError) => {
  expect(errorsOf(candidate)).toEqual([expect.stringContaining(expectedError)]);
});

it.each([
  ["left", withBodyPart(1, {x: 7, radius: 6})],
  ["top", withBodyPart(1, {y: 7, radius: 6})],
  ["bottom", withBodyPart(1, {y: 57, radius: 6})],
])("accepts a part whose stroke touches the %s edge exactly", (_edge, candidate) => {
  expect(errorsOf(candidate)).toEqual([]);
});

it("refuses a projectile part that sticks out of the space, and names it", () => {
  const appearance = passingAppearance();
  appearance.projectile = [
    polygonOf([
      [10, 10],
      [80, 12],
      [20, 40],
    ]),
  ];

  expect(errorsOf(appearance)).toEqual(["projectile.0: reaches outside the 64 by 64 space (right edge 81)"]);
});

it("refuses a part that is turned out of the space, though unturned it fits", () => {
  const turned = withBodyPart(0, {x: 30, y: 40, width: 30, height: 4, rotation: 90});
  const unturned = withBodyPart(0, {x: 30, y: 40, width: 30, height: 4, rotation: 0});

  expect(errorsOf(turned)).toEqual([expect.stringContaining("body.0: reaches outside")]);
  expect(errorsOf(unturned)).toEqual([]);
});

it("lists every problem, not only the first", () => {
  const appearance = withBodyPart(0, {strokeWidth: 9, opacity: 2});

  expect(errorsOf(appearance).map(error => error.split(":")[0])).toEqual(["body.0.strokeWidth", "body.0.opacity"]);
});

it("shortens a long message, so words the model or player chose cannot fill the list", () => {
  const errors = errorsOf({...passingAppearance(), ["x".repeat(500)]: 1});

  expect(errors.length).toBeGreaterThan(0);
  expect(errors.every(error => error.length <= 120)).toBe(true);
});
