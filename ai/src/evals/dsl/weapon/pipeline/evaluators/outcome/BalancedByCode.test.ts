import {balancedByCode} from "@evals/dsl/weapon/pipeline/evaluators/outcome/BalancedByCode";
import {passingWeaponEvalInput} from "@evals/dsl/weapon/pipeline/evaluators/testing/input/PassingWeaponEvalInput";

const REPAIRED_NODES = [
  "precheck",
  "moderation",
  "generate",
  "validate",
  "rate",
  "repair",
  "validate",
  "balance",
  "rate",
];

it("passes a weapon that code balanced, with no repair, when no repair is allowed", () => {
  const nodes = ["precheck", "moderation", "generate", "validate", "balance", "rate"];

  expect(balancedByCode(passingWeaponEvalInput({outcome: {nodes}}), 0).score).toBe(1);
});

it("fails a weapon that needed a repair when none is allowed, because the model was asked to fix what code should have", () => {
  expect(balancedByCode(passingWeaponEvalInput({outcome: {nodes: REPAIRED_NODES}}), 0).comment).toBe(
    "repair ran 1 times, allowed 0, but code should have balanced the weapon; the nodes were [precheck, moderation, generate, validate, rate, repair, validate, balance, rate]",
  );
});

it("passes a weapon the model repaired once and code then balanced, when one repair is allowed", () => {
  expect(balancedByCode(passingWeaponEvalInput({outcome: {nodes: REPAIRED_NODES}}), 1).score).toBe(1);
});

it("counts the repairs of the stats, not of the drawing", () => {
  const nodes = [
    "precheck",
    "moderation",
    "generate",
    "validate",
    "balance",
    "rate",
    "appearance.generate",
    "appearance.repair",
  ];

  expect(balancedByCode(passingWeaponEvalInput({outcome: {nodes}}), 0).score).toBe(1);
});

it("fails a weapon that was never balanced, however many repairs are allowed", () => {
  const nodes = ["precheck", "moderation", "generate", "validate", "rate"];

  expect(balancedByCode(passingWeaponEvalInput({outcome: {nodes}}), 1).score).toBe(0);
});

it("fails a request that did not end in a weapon, because nothing was balanced", () => {
  const score = balancedByCode(
    passingWeaponEvalInput({outcome: {status: "invalid", nodes: ["precheck", "moderation"]}}),
    0,
  );

  expect(score.comment).toBe("expected a weapon to be created and balanced, got invalid");
});

it("names itself balancedByCode in the report, whether it passes or fails", () => {
  const nodes = ["precheck", "moderation", "generate", "validate", "balance", "rate"];

  expect(balancedByCode(passingWeaponEvalInput({outcome: {nodes}}), 0).key).toBe("balancedByCode");
  expect(balancedByCode(passingWeaponEvalInput({outcome: {status: "rejected"}}), 0).key).toBe("balancedByCode");
});
