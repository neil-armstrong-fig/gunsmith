import {FakeListChatModel} from "@langchain/core/utils/testing";
import {generateWeapon} from "@src/pipeline/GenerateWeapon";
import type {WeaponPipelineDeps} from "@src/pipeline/types/WeaponPipelineDeps";

function fakeDeps(): WeaponPipelineDeps {
  return {generator: new FakeListChatModel({responses: ["{}"]}), moderator: new FakeListChatModel({responses: ["{}"]})};
}

it("rejects an over-long prompt without calling a model", async () => {
  const deps = fakeDeps();
  const generatorCall = vi.spyOn(deps.generator, "invoke");
  const moderatorCall = vi.spyOn(deps.moderator, "invoke");

  const outcome = await generateWeapon({prompt: "a very large rifle. ".repeat(200)}, deps);

  expect(outcome.status).toBe("rejected");
  expect(outcome.modelCalls).toBe(0);
  expect(generatorCall).not.toHaveBeenCalled();
  expect(moderatorCall).not.toHaveBeenCalled();
});

it("rejects an empty prompt with a reason the player can read", async () => {
  const outcome = await generateWeapon({prompt: "  "}, fakeDeps());

  expect(outcome).toEqual({status: "rejected", reason: "Describe the weapon you want.", modelCalls: 0});
});
