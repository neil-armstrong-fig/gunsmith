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
    nodes: ["precheck", "moderation"],
    modelCalls: 1,
  });

  expect(weaponOutcomeFromState(state)).toEqual({
    status: "rejected",
    reason: "That is a recipe.",
    nodes: ["precheck", "moderation"],
    modelCalls: 1,
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
  });
});
