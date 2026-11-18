import {specNameOf} from "@evals/eval-criteria-mapping/environment/reporting/spec-name/SpecNameOf";

it("names a spec after its file, without the folders or the .eval.ts", () => {
  expect(specNameOf("/work/ai/evals/specs/AskingForAWeapon.eval.ts")).toBe("AskingForAWeapon");
});

it("falls back to a name that says it is unknown when the path is not known", () => {
  expect(specNameOf(undefined)).toBe("unknown-spec");
});
