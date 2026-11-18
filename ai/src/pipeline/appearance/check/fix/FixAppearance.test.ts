import {fixAppearance} from "@gunsmith/ai/pipeline/appearance/check/fix/FixAppearance";
import {passingAppearance} from "@gunsmith/ai/pipeline/appearance/testing/PassingAppearance";

it("changes nothing in an answer that is already complete", () => {
  expect(fixAppearance(passingAppearance())).toEqual({candidate: passingAppearance(), changes: []});
});

it("reads the text-encoded fields first and then fills what is missing, and lists each thing it did in order", () => {
  const fixed = fixAppearance(sloppyAnswer());

  expect(fixed.changes).toEqual([
    "body",
    "version",
    "palette",
    "body.opacity",
    "body.rotation",
    "body.detail",
    "body.x",
    "body.y",
    "projectile",
    "impact",
    "animation",
  ]);
});

it("leaves a part with no position as it is, because the code never invents one", () => {
  const fixed = fixAppearance({body: [{kind: "circle", radius: 5}]});

  expect(fixed.candidate).toMatchObject({body: [expect.not.objectContaining({x: expect.anything()})]});
});

it("hands on no answer at all unchanged, so the check can say there was none", () => {
  expect(fixAppearance(undefined)).toEqual({candidate: undefined, changes: []});
});

/** What a model really wrote on the local tier: nested text, and no opacity, rotation or origin on any part. */
function sloppyAnswer(): Record<string, unknown> {
  const source = passingAppearance();
  const bare = (source.body as Record<string, unknown>[]).map(part => {
    const {opacity: _opacity, rotation: _rotation, detail: _detail, ...rest} = part;

    if (part.kind === "polygon") {
      return {...rest, x: undefined, y: undefined};
    }

    return rest;
  });

  return {body: JSON.stringify(bare)};
}
