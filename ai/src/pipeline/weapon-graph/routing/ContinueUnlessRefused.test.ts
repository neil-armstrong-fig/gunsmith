import {END} from "@langchain/langgraph";
import {weaponGraphStateOf} from "@gunsmith/ai/pipeline/weapon-graph/testing/WeaponGraphStateOf";
import {continueUnlessRefused} from "@gunsmith/ai/pipeline/weapon-graph/routing/ContinueUnlessRefused";

it("goes on to the next node when the last check passed", () => {
  expect(continueUnlessRefused("balance")(weaponGraphStateOf())).toBe("balance");
});

it("sends a refused draft to repair when the repair has not been spent", () => {
  const state = weaponGraphStateOf({errors: ["bulletDamage: Too big"], repaired: false});

  expect(continueUnlessRefused("balance")(state)).toBe("repair");
});

it("ends the run on a refusal after the repair, so a draft is repaired once and never twice", () => {
  const state = weaponGraphStateOf({errors: ["bulletDamage: Too big"], repaired: true});

  expect(continueUnlessRefused("balance")(state)).toBe(END);
});
