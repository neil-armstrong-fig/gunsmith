import {completeAppearance} from "@gunsmith/ai/pipeline/appearance/check/fix/complete/CompleteAppearance";
import {passingAppearance} from "@gunsmith/ai/pipeline/appearance/testing/PassingAppearance";
import {validateAppearance} from "@gunsmith/ai/pipeline/appearance/check/validate/ValidateAppearance";

function withoutKeys(record: Record<string, unknown>, keys: string[]): Record<string, unknown> {
  return Object.fromEntries(Object.entries(record).filter(([key]) => !keys.includes(key)));
}

function bodyOf(candidate: unknown): Record<string, unknown>[] {
  return (candidate as {body: Record<string, unknown>[]}).body;
}

it("changes nothing in an appearance that is complete", () => {
  const candidate = passingAppearance();

  expect(completeAppearance(candidate)).toEqual({candidate, changes: []});
});

it("fills each top-level block that is absent, and says which", () => {
  const source = withoutKeys(passingAppearance(), ["version", "palette", "projectile", "impact", "animation"]);
  const result = completeAppearance(source);

  expect(result.candidate).toEqual(passingAppearance());
  expect(result.changes).toEqual(["version", "palette", "projectile", "impact", "animation"]);
});

it("fills a half-written palette and impact, keeping what was written", () => {
  const source = {
    ...passingAppearance(),
    palette: {accent: "weapon-pink"},
    impact: {preset: "ring"},
  };
  const result = completeAppearance(source);

  expect(result.candidate).toMatchObject({
    palette: {accent: "weapon-pink", "accent-secondary": "weapon-orange"},
    impact: {preset: "ring", colour: "accent"},
  });
  expect(result.changes).toEqual(["palette.accent-secondary", "impact.colour"]);
});

it("fills what a part leaves out, once for the whole body in what it reports", () => {
  const source = passingAppearance();
  const bare = bodyOf(source).map(part =>
    withoutKeys(part, ["opacity", "rotation", "detail", "strokeWidth", "stroke"]),
  );
  const result = completeAppearance({...source, body: bare});

  expect(result.candidate).toEqual(source);
  expect(result.changes).toEqual(["body.stroke", "body.strokeWidth", "body.opacity", "body.rotation", "body.detail"]);
});

it("fills a missing fill: nothing for a line, the body colour for a shape", () => {
  const source = {
    ...passingAppearance(),
    body: [
      {kind: "rect", x: 10, y: 10, width: 10, height: 10},
      {
        kind: "polyline",
        points: [
          [1, 1],
          [9, 9],
        ],
      },
    ],
  };
  const body = bodyOf(completeAppearance(source).candidate);

  expect(body[0]).toMatchObject({fill: "body"});
  expect(body[1]).toMatchObject({fill: "none", x: 0, y: 0});
});

it("fills the origin a polygon or polyline's points are local to, and nothing else about where", () => {
  const source = {
    ...passingAppearance(),
    body: [
      {
        kind: "polygon",
        points: [
          [1, 1],
          [9, 9],
          [1, 9],
        ],
      },
      {kind: "circle", radius: 5},
      {kind: "rect", width: 5, height: 5},
    ],
  };
  const body = bodyOf(completeAppearance(source).candidate);

  expect(body[0]).toMatchObject({x: 0, y: 0});
  expect(body[1]).not.toHaveProperty("x");
  expect(body[1]).not.toHaveProperty("y");
  expect(body[2]).not.toHaveProperty("x");
});

it("leaves a block that is not a record for the strict check to refuse", () => {
  const source = {...passingAppearance(), palette: "weapon-blue", impact: [1], animation: 5};
  const result = completeAppearance(source);

  expect(result).toEqual({candidate: source, changes: []});
});

it("fills the parts of the projectile as it fills the body's", () => {
  const source = {...passingAppearance(), projectile: [{kind: "circle", x: 32, y: 32, radius: 4}]};

  expect(completeAppearance(source).changes).toContain("projectile.opacity");
  expect(bodyOf({body: (completeAppearance(source).candidate as {projectile: unknown[]}).projectile})[0]).toMatchObject(
    {
      opacity: 1,
      rotation: 0,
    },
  );
});

it("never changes a value the model wrote, however wrong", () => {
  const source = {
    ...passingAppearance(),
    palette: {accent: "weapon-red", "accent-secondary": "weapon-blue"},
    body: [
      {
        kind: "circle",
        x: 32,
        y: 32,
        radius: 5,
        fill: "red",
        stroke: "outline",
        strokeWidth: 9,
        opacity: 5,
        rotation: 999,
        detail: "tiny",
      },
    ],
  };
  const result = completeAppearance(source);

  expect(result.candidate).toMatchObject({
    palette: {accent: "weapon-red"},
    body: [{fill: "red", strokeWidth: 9, opacity: 5, rotation: 999, detail: "tiny"}],
  });
  expect(validateAppearance(result.candidate).ok).toBe(false);
});

it("passes through what it cannot complete: not an object, or a body that is not a list of objects", () => {
  expect(completeAppearance(undefined)).toEqual({candidate: undefined, changes: []});
  expect(completeAppearance("a rifle")).toEqual({candidate: "a rifle", changes: []});
  expect(completeAppearance({...passingAppearance(), body: "text"}).candidate).toMatchObject({body: "text"});
  expect(bodyOf(completeAppearance({...passingAppearance(), body: [null, 5]}).candidate)).toEqual([null, 5]);
});

it("gives an appearance of nothing but a few shapes everything else it needs to be valid", () => {
  const source = {
    body: [
      {kind: "rect", x: 12, y: 26, width: 40, height: 12},
      {kind: "circle", x: 28, y: 32, radius: 6, fill: "accent"},
    ],
  };

  expect(validateAppearance(completeAppearance(source).candidate).ok).toBe(true);
});

it("does not change what it was given", () => {
  const source = withoutKeys(passingAppearance(), ["palette"]);
  const before = JSON.stringify(source);

  completeAppearance(source);

  expect(JSON.stringify(source)).toBe(before);
});

it("gives each caller its own defaults, so changing one answer cannot change the next", () => {
  const first = completeAppearance({body: []}).candidate as {palette: {accent: string}; projectile: unknown[]};
  first.palette.accent = "weapon-pink";
  first.projectile.push(1);
  const second = completeAppearance({body: []}).candidate as {palette: {accent: string}; projectile: unknown[]};

  expect(second.palette.accent).toBe("weapon-blue");
  expect(second.projectile).toEqual([]);
});
