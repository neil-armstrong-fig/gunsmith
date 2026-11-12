import {createEvalModels} from "@evals/models/CreateEvalModels";
import {runWeaponCase} from "@evals/weapons/RunWeaponCase";
import {weaponEvalCases} from "@evals/weapons/WeaponEvalCases";
import {generateWeapon} from "@gunsmith/ai/pipeline/GenerateWeapon";
import type {WeaponOutcome} from "@gunsmith/ai/pipeline/types/WeaponOutcome";

vi.mock("@gunsmith/ai/pipeline/GenerateWeapon", () => ({generateWeapon: vi.fn()}));

const created: WeaponOutcome = {
  status: "created",
  weapon: {name: "Proof Rifle", damage: 20, rateOfFire: 6},
  nodes: ["precheck", "generate"],
  modelCalls: 1,
};

const rejected: WeaponOutcome = {status: "rejected", reason: "off topic", nodes: ["precheck"], modelCalls: 0};

function caseNamed(name: string): (typeof weaponEvalCases)[number] {
  const found = weaponEvalCases.find(evalCase => evalCase.name === name);
  if (!found) {
    throw new Error(`no eval case named ${name}`);
  }

  return found;
}

it("runs the pipeline once per trial", async () => {
  vi.mocked(generateWeapon).mockResolvedValue(created);

  const run = await runWeaponCase(caseNamed("plain request"), createEvalModels("fake"), 3);

  expect(generateWeapon).toHaveBeenCalledTimes(3);
  expect(run.outcomes).toHaveLength(3);
});

it("scores every evaluator once, combined across the trials", async () => {
  vi.mocked(generateWeapon).mockResolvedValue(created);

  const run = await runWeaponCase(caseNamed("plain request"), createEvalModels("fake"), 3);

  expect(run.scores.map(score => score.key)).toEqual([
    "outcomeMatches",
    "schemaValid",
    "withinCaps",
    "nameHygiene",
    "noPromptLeak",
    "modelCallBudget",
    "nodePath",
  ]);
});

it("fails an evaluator that failed in only one of the trials", async () => {
  vi.mocked(generateWeapon)
    .mockResolvedValueOnce(created)
    .mockResolvedValueOnce(rejected)
    .mockResolvedValueOnce(created);

  const run = await runWeaponCase(caseNamed("plain request"), createEvalModels("fake"), 3);

  expect(run.scores.filter(score => score.score === 0)).toEqual([
    {key: "outcomeMatches", score: 0, comment: "failed in 1 of 3 trials: expected created, got rejected"},
  ]);
});

it("reports a case the pipeline gets wrong, naming the evaluator that caught it", async () => {
  vi.mocked(generateWeapon).mockResolvedValue(created);

  const run = await runWeaponCase(caseNamed("not a weapon"), createEvalModels("fake"), 1);

  expect(run.scores.filter(score => score.score === 0).map(score => score.key)).toEqual(["outcomeMatches"]);
});
