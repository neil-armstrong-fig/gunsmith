import {END} from "@langchain/langgraph";
import {weaponGraphStateOf} from "@gunsmith/ai/pipeline/weapon/graph/testing/WeaponGraphStateOf";
import {continueUnlessRejected} from "@gunsmith/ai/pipeline/weapon/graph/routing/ContinueUnlessRejected";

it("goes on to the next node when the request has not been turned away", () => {
  expect(continueUnlessRejected("generate")(weaponGraphStateOf())).toBe("generate");
});

it("ends the run when the request has been turned away", () => {
  const state = weaponGraphStateOf({rejectionReason: "That is a recipe."});

  expect(continueUnlessRejected("generate")(state)).toBe(END);
});
