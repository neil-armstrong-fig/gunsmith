import {weaponGraphStateOf} from "@gunsmith/ai/pipeline/weapon-graph/testing/WeaponGraphStateOf";
import {validateNode} from "@gunsmith/ai/pipeline/weapon-graph/checking/ValidateNode";

const RIFLE = {
  name: "Proof Rifle",
  bulletDamage: 24,
  fireIntervalSeconds: 0.2,
  bulletSpeed: 20,
  magazineSize: 12,
  reloadSeconds: 1.5,
  startingReserve: 36,
};

it("keeps a draft that parses, with the preference apart from the weapon, and clears the last refusal", () => {
  const state = weaponGraphStateOf({
    draft: {...RIFLE, preference: {favoured: ["damage"], sacrificed: []}},
    errors: ["left over from the first try"],
  });

  expect(validateNode(state)).toEqual({
    candidate: {weapon: RIFLE, preference: {favoured: ["damage"], sacrificed: []}},
    errors: [],
    nodes: ["validate"],
  });
});

it("refuses a draft that does not parse, with a sentence for each fault, and keeps nothing", () => {
  const update = validateNode(weaponGraphStateOf({draft: {...RIFLE, magazineSize: 12.5}}));

  expect(update.errors).toEqual([expect.stringContaining("magazineSize:")]);
  expect(update.nodes).toEqual(["validate"]);
  expect(update.candidate).toBeUndefined();
});

it("refuses a draft that is not an object at all", () => {
  const update = validateNode(weaponGraphStateOf({draft: undefined}));

  expect(update.nodes).toEqual(["validate"]);
  expect(update.errors).toEqual([expect.stringContaining("weapon")]);
  expect(update.candidate).toBeUndefined();
});
