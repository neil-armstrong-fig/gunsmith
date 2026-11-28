import {weaponGraphStateOf} from "@gunsmith/ai/pipeline/weapon/graph/testing/WeaponGraphStateOf";
import {precheckNode} from "@gunsmith/ai/pipeline/weapon/graph/screening/PrecheckNode";

it("lets a short request through, noting that it ran and costing nothing", () => {
  expect(precheckNode(weaponGraphStateOf({prompt: "a mild rifle"}))).toEqual({nodes: ["precheck"]});
});

it("turns away a request that is too long, with the reason, without a model call", () => {
  const update = precheckNode(weaponGraphStateOf({prompt: "a very large rifle. ".repeat(200)}));

  expect(update.nodes).toEqual(["precheck"]);
  expect(update.rejectionReason).toContain("too long");
  expect(update.rejectionReason).toContain("the limit is 600");
  expect(update.modelCalls).toBeUndefined();
});

it("turns away an empty request with a reason the player can read", () => {
  expect(precheckNode(weaponGraphStateOf({prompt: "  "}))).toEqual({
    nodes: ["precheck"],
    rejectionReason: "Describe the weapon you want.",
  });
});
