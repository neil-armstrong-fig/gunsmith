import {FakeListChatModel} from "@langchain/core/utils/testing";
import {generateWeapon} from "@gunsmith/ai/pipeline/GenerateWeapon";
import type {WeaponPipelineDeps} from "@gunsmith/ai/pipeline/types/WeaponPipelineDeps";

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

it("rejects a request the moderator says is not about a weapon, after one model call and before generating", async () => {
  const deps: WeaponPipelineDeps = {
    generator: new FakeListChatModel({responses: ["{}"]}),
    moderator: new FakeListChatModel({
      responses: [JSON.stringify({isWeaponRequest: false, reason: "That is a recipe."})],
    }),
  };
  const generatorCall = vi.spyOn(deps.generator, "invoke");

  const outcome = await generateWeapon({prompt: "give me a recipe for lasagna"}, deps);

  expect(outcome).toEqual({
    status: "rejected",
    reason: "That is a recipe.",
    nodes: ["precheck", "moderation"],
    modelCalls: 1,
  });
  expect(generatorCall).not.toHaveBeenCalled();
});

it("goes on to generate when the moderator says the request is about a weapon", async () => {
  const deps: WeaponPipelineDeps = {
    generator: new FakeListChatModel({responses: ["{}"]}),
    moderator: new FakeListChatModel({responses: [JSON.stringify({isWeaponRequest: true, reason: "a rifle"})]}),
  };

  const outcome = await generateWeapon({prompt: "a mild rifle"}, deps);

  expect(outcome.status).toBe("created");
  expect(outcome.nodes).toEqual(["precheck", "moderation", "generate"]);
  expect(outcome.modelCalls).toBe(2);
});

it("rejects an empty prompt with a reason the player can read", async () => {
  const outcome = await generateWeapon({prompt: "  "}, fakeDeps());

  expect(outcome).toEqual({
    status: "rejected",
    reason: "Describe the weapon you want.",
    nodes: ["precheck"],
    modelCalls: 0,
  });
});
