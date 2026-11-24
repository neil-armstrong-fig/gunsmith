import {passingAppearance} from "@gunsmith/ai/pipeline/appearance/testing/PassingAppearance";
import type {AppearanceOutcome} from "@gunsmith/ai/pipeline/appearance/types/AppearanceOutcome";
import {weaponGraphStateOf} from "@gunsmith/ai/pipeline/weapon-graph/testing/WeaponGraphStateOf";
import {weaponOutcomeFromState} from "@gunsmith/ai/pipeline/weapon-graph/outcome/WeaponOutcomeFromState";

const RIFLE = {
  name: "Proof Rifle",
  bulletDamage: 24,
  fireIntervalSeconds: 0.2,
  bulletSpeed: 20,
  magazineSize: 12,
  reloadSeconds: 1.5,
  startingReserve: 36,
  visionDegrees: 90,
  visionRange: 12,
};

const DRAWN: AppearanceOutcome = {
  status: "valid",
  appearance: passingAppearance(),
  changes: [],
  errors: [],
  nodes: ["generate", "fix", "validate"],
  modelCalls: 1,
  usage: {inputTokens: 0, outputTokens: 0},
};

it("is a rejection, with the reason and the path, when the request was turned away", () => {
  const state = weaponGraphStateOf({
    rejectionReason: "That is a recipe.",
    relevance: "irrelevant",
    nodes: ["precheck", "moderation"],
    modelCalls: 1,
  });

  expect(weaponOutcomeFromState(state)).toEqual({
    status: "rejected",
    reason: "That is a recipe.",
    nodes: ["precheck", "moderation"],
    modelCalls: 1,
    history: {pipelineVersion: "weapon-v1", relevance: "irrelevant", codeEdits: 0, modelRepairs: 0},
  });
});

it("is a created weapon, with its drawing, when the weapon was drawn", () => {
  const state = weaponGraphStateOf({
    weapon: RIFLE,
    appearance: DRAWN,
    nodes: ["precheck", "appearance.generate"],
    modelCalls: 3,
  });

  expect(weaponOutcomeFromState(state)).toEqual({
    status: "created",
    weapon: RIFLE,
    appearance: DRAWN,
    nodes: ["precheck", "appearance.generate"],
    modelCalls: 3,
    history: {pipelineVersion: "weapon-v1", relevance: "not-judged", codeEdits: 0, modelRepairs: 0},
  });
});

it("is invalid, with no weapon, when the weapon was never drawn, even if an earlier try left one in the state", () => {
  const state = weaponGraphStateOf({
    weapon: RIFLE,
    errors: ["weapon: still refused"],
    nodes: ["validate"],
    modelCalls: 3,
  });

  expect(weaponOutcomeFromState(state)).toEqual({
    status: "invalid",
    reason: "We could not build a valid weapon from that request. Try describing it differently.",
    nodes: ["validate"],
    modelCalls: 3,
    history: {
      pipelineVersion: "weapon-v1",
      relevance: "not-judged",
      codeEdits: 0,
      modelRepairs: 0,
      validationFailure: "invalid-draft",
    },
  });
});

it("reports the rating failure when the repaired draft still fails the rating check", () => {
  const state = weaponGraphStateOf({
    errors: ["over budget"],
    nodes: [
      "precheck",
      "moderation",
      "generate",
      "validate",
      "balance",
      "rate",
      "repair",
      "validate",
      "balance",
      "rate",
    ],
  });

  expect(weaponOutcomeFromState(state)).toHaveProperty("history.validationFailure", "rating-out-of-bounds");
});

it("counts both model repairs and combines stat edits with drawing edits", () => {
  const state = weaponGraphStateOf({
    relevance: "accepted",
    codeEdits: 2,
    weapon: RIFLE,
    appearance: {...DRAWN, status: "repaired", changes: ["finished the outline"]},
    nodes: ["precheck", "moderation", "repair", "appearance.generate", "appearance.repair"],
  });

  expect(weaponOutcomeFromState(state).history).toEqual({
    pipelineVersion: "weapon-v1",
    relevance: "accepted",
    codeEdits: 3,
    modelRepairs: 2,
  });
});
