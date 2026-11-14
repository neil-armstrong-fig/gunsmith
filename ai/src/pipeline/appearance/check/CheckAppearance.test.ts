import {checkAppearance} from "@gunsmith/ai/pipeline/appearance/check/CheckAppearance";
import {passingAppearance} from "@gunsmith/ai/pipeline/appearance/testing/PassingAppearance";

/** What a model really wrote on the local tier: nested text, and no opacity, rotation or origin on any part. */
function sloppyAnswer(): Record<string, unknown> {
  const source = passingAppearance();
  const bare = (source.body as Record<string, unknown>[]).map(part => {
    const {opacity: _opacity, rotation: _rotation, detail: _detail, ...rest} = part;

    return part.kind === "polygon" ? {...rest, x: undefined, y: undefined} : rest;
  });

  return {body: JSON.stringify(bare)};
}

it("accepts an answer that is already complete, and changes nothing", () => {
  const result = checkAppearance(passingAppearance());

  expect(result).toEqual({ok: true, appearance: passingAppearance(), changes: [], nodes: ["fix", "validate"]});
});

it("fixes a sloppy answer first and then accepts it, and says what the code did", () => {
  const result = checkAppearance(sloppyAnswer());

  expect(result.ok).toBe(true);
  expect(result.changes).toContain("body");
  expect(result.changes).toContain("body.opacity");
  expect(result.nodes).toEqual(["fix", "validate"]);
});

it("still refuses a wrong value, and still says what the code did", () => {
  const source = sloppyAnswer();
  const answer = {...source, palette: {accent: "weapon-red"}};
  const result = checkAppearance(answer);

  expect(result.ok).toBe(false);
  expect(result.ok ? [] : result.errors).toEqual([expect.stringContaining("palette.accent: Invalid option")]);
  expect(result.changes).toContain("body");
});

it("refuses a part with no position, since the code does not invent one", () => {
  const answer = {body: [{kind: "circle", radius: 5}]};
  const result = checkAppearance(answer);

  expect(result.ok ? [] : result.errors).toEqual([
    "body.0.x: Invalid input: expected number, received undefined",
    "body.0.y: Invalid input: expected number, received undefined",
  ]);
});

it("refuses no answer at all", () => {
  expect(checkAppearance(undefined)).toEqual({
    ok: false,
    errors: ["appearance: Invalid input: expected object, received undefined"],
    changes: [],
    nodes: ["fix", "validate"],
  });
});

it("holds a completed answer to the same limits: a part out of the space is refused", () => {
  const result = checkAppearance({body: [{kind: "rect", x: 60, y: 10, width: 20, height: 5}]});

  expect(result.ok ? [] : result.errors).toEqual([
    "body.0 (rect): reaches outside the 64 by 64 space (right edge 81); pull it in by 17 so its right edge, stroke included, is at most 64",
  ]);
});
