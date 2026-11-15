import {FakeListChatModel} from "@langchain/core/utils/testing";
import {generateWeapon} from "@gunsmith/ai/pipeline/GenerateWeapon";
import type {WeaponPipelineDependencies} from "@gunsmith/ai/pipeline/types/WeaponPipelineDependencies";

function fakeWeaponPipelineDependencies(): WeaponPipelineDependencies {
  return {generator: new FakeListChatModel({responses: ["{}"]}), moderator: new FakeListChatModel({responses: ["{}"]})};
}

it("rejects an over-long prompt without calling a model", async () => {
  const weaponPipelineDependencies = fakeWeaponPipelineDependencies();
  const generatorCall = vi.spyOn(weaponPipelineDependencies.generator, "invoke");
  const moderatorCall = vi.spyOn(weaponPipelineDependencies.moderator, "invoke");

  const outcome = await generateWeapon({prompt: "a very large rifle. ".repeat(200)}, weaponPipelineDependencies);

  expect(outcome.status).toBe("rejected");
  expect(outcome.modelCalls).toBe(0);
  expect(generatorCall).not.toHaveBeenCalled();
  expect(moderatorCall).not.toHaveBeenCalled();
});

it("rejects a request the moderator says is not about a weapon, after one model call and before generating", async () => {
  const weaponPipelineDependencies: WeaponPipelineDependencies = {
    generator: new FakeListChatModel({responses: ["{}"]}),
    moderator: new FakeListChatModel({
      responses: [JSON.stringify({isWeaponRequest: false, reason: "That is a recipe."})],
    }),
  };
  const generatorCall = vi.spyOn(weaponPipelineDependencies.generator, "invoke");

  const outcome = await generateWeapon({prompt: "give me a recipe for lasagna"}, weaponPipelineDependencies);

  expect(outcome).toEqual({
    status: "rejected",
    reason: "That is a recipe.",
    nodes: ["precheck", "moderation"],
    modelCalls: 1,
  });
  expect(generatorCall).not.toHaveBeenCalled();
});

const RIFLE = {
  name: "Proof Rifle",
  bulletDamage: 24,
  fireIntervalSeconds: 0.2,
  bulletSpeed: 20,
  magazineSize: 12,
  reloadSeconds: 1.5,
  startingReserve: 36,
};

const TOO_STRONG = {
  ...RIFLE,
  bulletDamage: 100,
  fireIntervalSeconds: 0.05,
  bulletSpeed: 60,
  magazineSize: 60,
  reloadSeconds: 0.5,
  startingReserve: 200,
};
const OUT_OF_RANGE = {...RIFLE, bulletDamage: 9999};

function weaponPipelineDependenciesWhereGeneratorSays(...replies: unknown[]): WeaponPipelineDependencies {
  return {
    generator: new FakeListChatModel({responses: replies.map(reply => JSON.stringify(reply))}),
    moderator: new FakeListChatModel({responses: [JSON.stringify({isWeaponRequest: true, reason: "a gun"})]}),
  };
}

it("creates the weapon the generator wrote when it is valid and within the cap", async () => {
  const outcome = await generateWeapon({prompt: "a mild rifle"}, weaponPipelineDependenciesWhereGeneratorSays(RIFLE));

  expect(outcome).toEqual({
    status: "created",
    weapon: RIFLE,
    nodes: ["precheck", "moderation", "generate", "validate", "balance", "rate"],
    modelCalls: 2,
  });
});

it("repairs a weapon that does not fit the schema, once, and creates the repaired one", async () => {
  const outcome = await generateWeapon(
    {prompt: "a rifle"},
    weaponPipelineDependenciesWhereGeneratorSays(OUT_OF_RANGE, RIFLE),
  );

  expect(outcome).toEqual({
    status: "created",
    weapon: RIFLE,
    nodes: ["precheck", "moderation", "generate", "validate", "repair", "validate", "balance", "rate"],
    modelCalls: 3,
  });
});

it("shows the model its first answer and the faults when it repairs", async () => {
  const weaponPipelineDependencies = weaponPipelineDependenciesWhereGeneratorSays(OUT_OF_RANGE, RIFLE);
  const invoke = vi.spyOn(weaponPipelineDependencies.generator, "invoke");

  await generateWeapon({prompt: "a rifle"}, weaponPipelineDependencies);

  const repairMessages = String(
    (invoke.mock.calls[1]?.[0] as {content: unknown}[]).map(message => message.content).join("\n"),
  );
  expect(repairMessages).toContain('<previous>\n{"name":"Proof Rifle","bulletDamage":9999');
  expect(repairMessages).toContain("bulletDamage: Too big");
});

it("balances a weapon that is over the limits instead of repairing it, so the model is asked once", async () => {
  const weaponPipelineDependencies = weaponPipelineDependenciesWhereGeneratorSays(TOO_STRONG);
  const invoke = vi.spyOn(weaponPipelineDependencies.generator, "invoke");

  const outcome = await generateWeapon({prompt: "everything at once"}, weaponPipelineDependencies);

  expect(outcome.status).toBe("created");
  expect(outcome.nodes).toEqual(["precheck", "moderation", "generate", "validate", "balance", "rate"]);
  expect(outcome.modelCalls).toBe(2);
  expect(invoke).toHaveBeenCalledTimes(1);
  expect((outcome.weapon as {bulletDamage: number}).bulletDamage).toBeLessThan(100);
});

it("gives a favoured stat more of the weapon than the same request with no preference", async () => {
  const neutral = await generateWeapon(
    {prompt: "everything"},
    weaponPipelineDependenciesWhereGeneratorSays(TOO_STRONG),
  );
  const favouring = await generateWeapon(
    {prompt: "everything, mostly damage"},
    weaponPipelineDependenciesWhereGeneratorSays({...TOO_STRONG, preference: {favoured: ["damage"], sacrificed: []}}),
  );

  expect((favouring.weapon as {bulletDamage: number}).bulletDamage).toBeGreaterThan(
    (neutral.weapon as {bulletDamage: number}).bulletDamage,
  );
});

it("never shows the player the preference: the weapon is its name and six numbers", async () => {
  const outcome = await generateWeapon(
    {prompt: "a rifle"},
    weaponPipelineDependenciesWhereGeneratorSays({...RIFLE, preference: {favoured: ["damage"], sacrificed: []}}),
  );

  expect(outcome.weapon).toEqual(RIFLE);
});

it("repairs a preference that names a stat there is not, once", async () => {
  const outcome = await generateWeapon(
    {prompt: "a rifle"},
    weaponPipelineDependenciesWhereGeneratorSays(
      {...RIFLE, preference: {favoured: ["accuracy"], sacrificed: []}},
      RIFLE,
    ),
  );

  expect(outcome.status).toBe("created");
  expect(outcome.nodes).toEqual([
    "precheck",
    "moderation",
    "generate",
    "validate",
    "repair",
    "validate",
    "balance",
    "rate",
  ]);
});

it("is invalid, with no weapon, when the repaired weapon is still out of range", async () => {
  const outcome = await generateWeapon(
    {prompt: "a rifle"},
    weaponPipelineDependenciesWhereGeneratorSays(OUT_OF_RANGE, OUT_OF_RANGE),
  );

  expect(outcome).toEqual({
    status: "invalid",
    reason: "We could not build a valid weapon from that request. Try describing it differently.",
    nodes: ["precheck", "moderation", "generate", "validate", "repair", "validate"],
    modelCalls: 3,
  });
});

it("is invalid when the repaired weapon is still out of range, and never repairs a second time", async () => {
  const generator = new FakeListChatModel({responses: [JSON.stringify(OUT_OF_RANGE)]});
  const invoke = vi.spyOn(generator, "invoke");
  const weaponPipelineDependencies: WeaponPipelineDependencies = {
    generator,
    moderator: weaponPipelineDependenciesWhereGeneratorSays().moderator,
  };

  const outcome = await generateWeapon({prompt: "a rifle"}, weaponPipelineDependencies);

  expect(outcome.status).toBe("invalid");
  expect(outcome.weapon).toBeUndefined();
  expect(invoke).toHaveBeenCalledTimes(2);
});

it("is invalid when the generator gives nothing at all, twice", async () => {
  const generator = new FakeListChatModel({responses: ["no weapon for you"]});

  const outcome = await generateWeapon(
    {prompt: "a rifle"},
    {generator, moderator: weaponPipelineDependenciesWhereGeneratorSays().moderator},
  );

  expect(outcome.status).toBe("invalid");
  expect(outcome.modelCalls).toBe(3);
});

it("rejects an empty prompt with a reason the player can read", async () => {
  const outcome = await generateWeapon({prompt: "  "}, fakeWeaponPipelineDependencies());

  expect(outcome).toEqual({
    status: "rejected",
    reason: "Describe the weapon you want.",
    nodes: ["precheck"],
    modelCalls: 0,
  });
});
