import {FakeListChatModel} from "@langchain/core/utils/testing";
import {weaponGraphStateOf} from "@gunsmith/ai/pipeline/weapon/graph/testing/WeaponGraphStateOf";
import {repairNode} from "@gunsmith/ai/pipeline/weapon/graph/drafting/RepairNode";

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

it("asks the model again, shows it the first answer and the faults, and spends the one repair", async () => {
  const generator = new FakeListChatModel({responses: [JSON.stringify(RIFLE)]});
  const invoke = vi.spyOn(generator, "invoke");
  const state = weaponGraphStateOf({draft: {...RIFLE, bulletDamage: 9999}, errors: ["bulletDamage: Too big"]});

  const update = await repairNode(state, generator);

  expect(update).toEqual({draft: RIFLE, repaired: true, nodes: ["repair"], modelCalls: 1});
  const sent = (invoke.mock.calls[0]?.[0] as {content: unknown}[]).map(message => String(message.content)).join("\n");
  expect(sent).toContain("bulletDamage: Too big");
  expect(sent).toContain('"bulletDamage":9999');
});
