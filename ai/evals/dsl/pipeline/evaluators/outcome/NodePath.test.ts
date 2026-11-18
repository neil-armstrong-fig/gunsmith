import {passingEvalInput} from "@evals/dsl/pipeline/evaluators/testing/input/PassingEvalInput";
import {nodePath} from "@evals/dsl/pipeline/evaluators/outcome/NodePath";
import type {WeaponOutcomeStatus} from "@gunsmith/ai/pipeline/types/WeaponOutcomeStatus";

const STATS = ["precheck", "moderation", "generate", "validate", "balance", "rate"];
const DRAWING = ["appearance.generate", "appearance.fix", "appearance.validate"];

it("passes a created weapon that was generated, validated, balanced and rated, then drawn", () => {
  expect(nodePath(ran([...STATS, ...DRAWING], "created")).score).toBe(1);
});

it("passes a created weapon that was repaired once and checked again", () => {
  const nodes = ["precheck", "moderation", "generate", "validate", "repair", "validate", "balance", "rate", ...DRAWING];

  expect(nodePath(ran(nodes, "created")).score).toBe(1);
});

it("passes a drawing that was repaired once and checked again", () => {
  const drawing = [...DRAWING, "appearance.repair", "appearance.fix", "appearance.validate"];

  expect(nodePath(ran([...STATS, ...drawing], "created")).score).toBe(1);
});

it("passes a drawing that ended as the disclosed stand-in", () => {
  const drawing = [...DRAWING, "appearance.repair", "appearance.fix", "appearance.validate", "appearance.fallback"];

  expect(nodePath(ran([...STATS, ...drawing], "created")).score).toBe(1);
});

it("fails a created weapon that was never drawn", () => {
  const score = nodePath(ran(STATS, "created"));

  expect(score.comment).toBe(
    "a created weapon must be drawn, but the nodes were [precheck, moderation, generate, validate, balance, rate]",
  );
});

it("fails a drawing that began before the weapon was rated", () => {
  const nodes = ["precheck", "moderation", "generate", "validate", "balance", "appearance.generate", "rate"];

  expect(nodePath(ran([...nodes, "appearance.fix", "appearance.validate"], "created")).score).toBe(0);
});

it("fails a drawing that did not start with generating it", () => {
  const score = nodePath(ran([...STATS, "appearance.fix", "appearance.validate"], "created"));

  expect(score.comment).toContain("the drawing must start with appearance.generate");
});

it("fails a drawing that did not end checked or as the stand-in", () => {
  const score = nodePath(ran([...STATS, "appearance.generate", "appearance.fix"], "created"));

  expect(score.comment).toContain("the drawing must end with appearance.validate or appearance.fallback");
});

it("fails two drawing repairs", () => {
  const drawing = [...DRAWING, "appearance.repair", "appearance.validate", "appearance.repair", "appearance.validate"];

  expect(nodePath(ran([...STATS, ...drawing], "created")).comment).toBe("appearance.repair ran 2 times, allowed 1");
});

it("allows one repair of the stats and one of the drawing together", () => {
  const nodes = [
    "precheck",
    "moderation",
    "generate",
    "validate",
    "repair",
    "validate",
    "balance",
    "rate",
    ...DRAWING,
    "appearance.repair",
    "appearance.fix",
    "appearance.validate",
  ];

  expect(nodePath(ran(nodes, "created")).score).toBe(1);
});

it("fails a weapon that was drawn and not created", () => {
  const score = nodePath(ran(["precheck", "moderation", "generate", "validate", "repair", "validate", ...DRAWING]));

  expect(score.comment).toBe(
    "a request that ended invalid must not be drawn, but the nodes were [precheck, moderation, generate, validate, repair, validate, appearance.generate, appearance.fix, appearance.validate]",
  );
});

it("fails a created weapon that was never validated", () => {
  const score = nodePath(ran(["precheck", "moderation", "generate", "balance", "rate"], "created"));

  expect(score.comment).toBe(
    "a created weapon must have been validated, but the nodes were [precheck, moderation, generate, balance, rate]",
  );
});

it("fails a created weapon that was never balanced", () => {
  const score = nodePath(ran(["precheck", "moderation", "generate", "validate", "rate"], "created"));

  expect(score.comment).toBe(
    "a created weapon must have been balanced, but the nodes were [precheck, moderation, generate, validate, rate]",
  );
});

it("fails a created weapon that was never rated", () => {
  const score = nodePath(ran(["precheck", "moderation", "generate", "validate", "balance"], "created"));

  expect(score.comment).toBe(
    "a created weapon must have been rated, but the nodes were [precheck, moderation, generate, validate, balance]",
  );
});

it("fails a created weapon that was rated before it was balanced", () => {
  const nodes = ["precheck", "moderation", "generate", "validate", "rate", "balance", ...DRAWING];

  expect(nodePath(ran(nodes, "created")).score).toBe(0);
});

it("fails a created weapon whose last check was before its repair", () => {
  const nodes = ["precheck", "moderation", "generate", "validate", "balance", "rate", "repair", ...DRAWING];

  expect(nodePath(ran(nodes, "created")).score).toBe(0);
});

it("passes a rejection that stopped at the pre-check", () => {
  expect(nodePath(ran(["precheck"], "rejected")).score).toBe(1);
});

it("passes a rejection that stopped at moderation", () => {
  expect(nodePath(ran(["precheck", "moderation"], "rejected")).score).toBe(1);
});

it("passes an invalid outcome after one repair", () => {
  expect(nodePath(ran(["precheck", "moderation", "generate", "validate", "repair", "validate"])).score).toBe(1);
});

it("fails two repairs", () => {
  const score = nodePath(ran(["precheck", "generate", "validate", "repair", "validate", "repair"]));

  expect(score.comment).toBe("repair ran 2 times, allowed 1");
});

it("fails when the pre-check was not first", () => {
  expect(nodePath(ran(["generate", "precheck"])).score).toBe(0);
});

it("fails when no node ran at all", () => {
  expect(nodePath(ran([])).score).toBe(0);
});

function ran(nodes: string[], status: WeaponOutcomeStatus = "invalid"): ReturnType<typeof passingEvalInput> {
  return passingEvalInput({outcome: {nodes, status}});
}
