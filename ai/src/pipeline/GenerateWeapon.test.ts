import {weaponDraftSchema} from "@gunsmith/ai/pipeline/weapon/WeaponDraft";
import {FakeListChatModel} from "@langchain/core/utils/testing";
import {generateWeapon} from "@gunsmith/ai/pipeline/GenerateWeapon";
import {fallbackAppearance} from "@gunsmith/shared/appearance/fallback/FallbackAppearance";
import {passingAppearance} from "@gunsmith/ai/pipeline/appearance/testing/PassingAppearance";
import {ToolCallingFakeModel} from "@gunsmith/ai/pipeline/appearance/testing/ToolCallingFakeModel";
import type {WeaponPipelineDependencies} from "@gunsmith/ai/pipeline/types/WeaponPipelineDependencies";

it("rejects an over-long prompt without calling a model", async () => {
  const weaponPipelineDependencies = fakeWeaponPipelineDependencies();
  const generatorCall = vi.spyOn(weaponPipelineDependencies.generator, "invoke");
  const moderatorCall = vi.spyOn(weaponPipelineDependencies.moderator, "invoke");
  const appearanceCall = vi.spyOn(weaponPipelineDependencies.appearanceGenerator, "invoke");

  const outcome = await generateWeapon({prompt: "a very large rifle. ".repeat(200)}, weaponPipelineDependencies);

  expect(outcome.status).toBe("rejected");
  expect(outcome.modelCalls).toBe(0);
  expect(generatorCall).not.toHaveBeenCalled();
  expect(moderatorCall).not.toHaveBeenCalled();
  expect(appearanceCall).not.toHaveBeenCalled();
});

it("rejects a request the moderator says is not about a weapon, after one model call and before generating", async () => {
  const weaponPipelineDependencies: WeaponPipelineDependencies = {
    generator: new FakeListChatModel({responses: ["{}"]}),
    moderator: new FakeListChatModel({
      responses: [JSON.stringify({isWeaponRequest: false, reason: "That is a recipe."})],
    }),
    appearanceGenerator: appearanceModelSaying(passingAppearance()),
  };
  const generatorCall = vi.spyOn(weaponPipelineDependencies.generator, "invoke");
  const appearanceCall = vi.spyOn(weaponPipelineDependencies.appearanceGenerator, "invoke");

  const outcome = await generateWeapon({prompt: "give me a recipe for lasagna"}, weaponPipelineDependencies);

  expect(outcome).toEqual({
    status: "rejected",
    reason: "That is a recipe.",
    nodes: ["precheck", "moderation"],
    modelCalls: 1,
  });
  expect(generatorCall).not.toHaveBeenCalled();
  expect(appearanceCall).not.toHaveBeenCalled();
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
const FRACTIONAL_MAGAZINE = {...RIFLE, magazineSize: 12.5};

/** A drawing the strict check refuses: a part reaching outside the canvas. */
const REFUSED_DRAWING = {...passingAppearance(), body: [{kind: "rect", x: 60, y: 10, width: 20, height: 5}]};

/** A drawing the code can finish: the body written as text, with nothing else filled in. */
const SLOPPY_DRAWING = {body: JSON.stringify([{kind: "rect", x: 12, y: 26, width: 40, height: 12}])};

const STATS_NODES = ["precheck", "moderation", "generate", "validate", "balance", "rate"];
const DRAWING_NODES = ["appearance.generate", "appearance.fix", "appearance.validate"];
const DRAWING_REPAIRED_NODES = [
  "appearance.generate",
  "appearance.fix",
  "appearance.validate",
  "appearance.repair",
  "appearance.fix",
  "appearance.validate",
];
const DRAWING_STAND_IN_NODES = [...DRAWING_REPAIRED_NODES, "appearance.fallback"];

it("creates the weapon the generator wrote when it is valid and within the cap, and draws it", async () => {
  const outcome = await generateWeapon({prompt: "a mild rifle"}, weaponPipelineDependenciesWhereGeneratorSays(RIFLE));

  expect(outcome).toEqual({
    status: "created",
    weapon: RIFLE,
    appearance: {
      status: "valid",
      appearance: passingAppearance(),
      changes: [],
      errors: [],
      nodes: ["generate", "fix", "validate"],
      modelCalls: 1,
      usage: {inputTokens: 0, outputTokens: 0},
    },
    nodes: [...STATS_NODES, ...DRAWING_NODES],
    modelCalls: 3,
  });
});

it("repairs a weapon that does not fit the schema, once, and creates and draws the repaired one", async () => {
  const outcome = await generateWeapon(
    {prompt: "a rifle"},
    weaponPipelineDependenciesWhereGeneratorSays(FRACTIONAL_MAGAZINE, RIFLE),
  );

  expect(outcome.status).toBe("created");
  expect(outcome.weapon).toEqual(RIFLE);
  expect(outcome.nodes).toEqual([
    "precheck",
    "moderation",
    "generate",
    "validate",
    "repair",
    "validate",
    "balance",
    "rate",
    ...DRAWING_NODES,
  ]);
  expect(outcome.modelCalls).toBe(4);
});

it("draws with its own model, once, after the weapon has passed, and asks the stats model nothing more", async () => {
  const weaponPipelineDependencies = weaponPipelineDependenciesWhereGeneratorSays(RIFLE);
  const generatorCall = vi.spyOn(weaponPipelineDependencies.generator, "invoke");
  const appearanceCall = vi.spyOn(weaponPipelineDependencies.appearanceGenerator, "invoke");

  await generateWeapon({prompt: "a rubber duck cannon"}, weaponPipelineDependencies);

  expect(generatorCall).toHaveBeenCalledTimes(1);
  expect(appearanceCall).toHaveBeenCalledTimes(1);
});

it("asks the drawing model for the player's own words, as data and not as an instruction", async () => {
  const weaponPipelineDependencies = weaponPipelineDependenciesWhereGeneratorSays(RIFLE);
  const appearanceCall = vi.spyOn(weaponPipelineDependencies.appearanceGenerator, "invoke");

  await generateWeapon({prompt: "a rubber duck cannon"}, weaponPipelineDependencies);

  const sent = (appearanceCall.mock.calls[0]?.[0] as {content: unknown}[]).map(message => String(message.content));
  expect(sent.join("\n")).toContain("a rubber duck cannon");
});

it("keeps a drawing the code finished, and says so, for the same three model calls", async () => {
  const outcome = await generateWeapon({prompt: "a rifle"}, weaponPipelineDependenciesWhereDrawerSays(SLOPPY_DRAWING));

  expect(outcome.status).toBe("created");
  expect(outcome.appearance?.status).toBe("completed");
  expect(outcome.appearance?.changes).toContain("body");
  expect(outcome.nodes).toEqual([...STATS_NODES, ...DRAWING_NODES]);
  expect(outcome.modelCalls).toBe(3);
});

it("repairs a refused drawing, once, and the weapon stays as it was", async () => {
  const outcome = await generateWeapon(
    {prompt: "a rifle"},
    weaponPipelineDependenciesWhereDrawerSays(REFUSED_DRAWING, passingAppearance()),
  );

  expect(outcome.status).toBe("created");
  expect(outcome.weapon).toEqual(RIFLE);
  expect(outcome.appearance?.status).toBe("repaired");
  expect(outcome.nodes).toEqual([...STATS_NODES, ...DRAWING_REPAIRED_NODES]);
  expect(outcome.modelCalls).toBe(4);
});

it("reaches the five-call ceiling when the stats and the drawing are both repaired", async () => {
  const weaponPipelineDependencies = {
    ...weaponPipelineDependenciesWhereGeneratorSays(FRACTIONAL_MAGAZINE, RIFLE),
    appearanceGenerator: appearanceModelSaying(REFUSED_DRAWING, passingAppearance()),
  };

  const outcome = await generateWeapon({prompt: "a rifle"}, weaponPipelineDependencies);

  expect(outcome.status).toBe("created");
  expect(outcome.appearance?.status).toBe("repaired");
  expect(outcome.modelCalls).toBe(5);
});

it("shows the disclosed stand-in, still created and with the weapon untouched, when the drawing cannot be repaired", async () => {
  const weaponPipelineDependencies = weaponPipelineDependenciesWhereDrawerSays(REFUSED_DRAWING);
  const appearanceCall = vi.spyOn(weaponPipelineDependencies.appearanceGenerator, "invoke");

  const outcome = await generateWeapon({prompt: "a rifle"}, weaponPipelineDependencies);

  expect(outcome.status).toBe("created");
  expect(outcome.weapon).toEqual(RIFLE);
  expect(outcome.appearance?.status).toBe("fallback");
  expect(outcome.appearance?.appearance).toEqual(fallbackAppearance());
  expect(outcome.nodes).toEqual([...STATS_NODES, ...DRAWING_STAND_IN_NODES]);
  expect(outcome.modelCalls).toBe(4);
  expect(appearanceCall).toHaveBeenCalledTimes(2);
});

it("never lets a drawing that cannot be made change a stat", async () => {
  const withStand = await generateWeapon(
    {prompt: "a rifle"},
    weaponPipelineDependenciesWhereDrawerSays(REFUSED_DRAWING),
  );
  const withDrawing = await generateWeapon({prompt: "a rifle"}, weaponPipelineDependenciesWhereGeneratorSays(RIFLE));

  expect(withStand.weapon).toEqual(withDrawing.weapon);
});

it("shows the model its first answer and the faults when it repairs", async () => {
  const weaponPipelineDependencies = weaponPipelineDependenciesWhereGeneratorSays(FRACTIONAL_MAGAZINE, RIFLE);
  const invoke = vi.spyOn(weaponPipelineDependencies.generator, "invoke");

  await generateWeapon({prompt: "a rifle"}, weaponPipelineDependencies);

  const repairMessages = String(
    (invoke.mock.calls[1]?.[0] as {content: unknown}[]).map(message => message.content).join("\n"),
  );
  expect(repairMessages).toContain(
    '<previous>\n{"name":"Proof Rifle","bulletDamage":24,"fireIntervalSeconds":0.2,"bulletSpeed":20,"magazineSize":12.5',
  );
  expect(repairMessages).toContain("magazineSize: Invalid input: expected int");
});

it("balances a weapon that is over the limits instead of repairing it, so the model is asked once", async () => {
  const weaponPipelineDependencies = weaponPipelineDependenciesWhereGeneratorSays(TOO_STRONG);
  const invoke = vi.spyOn(weaponPipelineDependencies.generator, "invoke");

  const outcome = await generateWeapon({prompt: "everything at once"}, weaponPipelineDependencies);

  expect(outcome.status).toBe("created");
  expect(outcome.nodes).toEqual([...STATS_NODES, ...DRAWING_NODES]);
  expect(outcome.modelCalls).toBe(3);
  expect(invoke).toHaveBeenCalledTimes(1);
  expect((outcome.weapon as {bulletDamage: number}).bulletDamage).toBeLessThan(100);
});

it("clamps a stat the model wrote past its range instead of repairing it: a magazine of 100 is created as 60, the model asked once", async () => {
  const weaponPipelineDependencies = weaponPipelineDependenciesWhereGeneratorSays({...RIFLE, magazineSize: 100});
  const invoke = vi.spyOn(weaponPipelineDependencies.generator, "invoke");

  const outcome = await generateWeapon({prompt: "a big magazine and plenty of spare ammo"}, weaponPipelineDependencies);

  expect(outcome.status).toBe("created");
  expect(outcome.nodes).toEqual([...STATS_NODES, ...DRAWING_NODES]);
  expect(outcome.modelCalls).toBe(3);
  expect(invoke).toHaveBeenCalledTimes(1);
  expect(weaponDraftSchema.safeParse(outcome.weapon).success).toBe(true);
  expect(outcome.weapon).toEqual({...RIFLE, magazineSize: 60});
});

it("brings a weapon that deals no damage up to the floor instead of repairing it", async () => {
  const outcome = await generateWeapon(
    {prompt: "a riot shield"},
    weaponPipelineDependenciesWhereGeneratorSays({...RIFLE, bulletDamage: 0}),
  );

  expect(outcome.status).toBe("created");
  expect(outcome.nodes).not.toContain("repair");
  expect(outcome.weapon).toEqual({...RIFLE, bulletDamage: 1});
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
    ...DRAWING_NODES,
  ]);
});

it("is invalid, with no weapon and no drawing, when the repaired weapon still fails the schema", async () => {
  const weaponPipelineDependencies = weaponPipelineDependenciesWhereGeneratorSays(
    FRACTIONAL_MAGAZINE,
    FRACTIONAL_MAGAZINE,
  );
  const appearanceCall = vi.spyOn(weaponPipelineDependencies.appearanceGenerator, "invoke");

  const outcome = await generateWeapon({prompt: "a rifle"}, weaponPipelineDependencies);

  expect(outcome).toEqual({
    status: "invalid",
    reason: "We could not build a valid weapon from that request. Try describing it differently.",
    nodes: ["precheck", "moderation", "generate", "validate", "repair", "validate"],
    modelCalls: 3,
  });
  expect(appearanceCall).not.toHaveBeenCalled();
});

it("is invalid when the repaired weapon still fails the schema, and never repairs a second time", async () => {
  const generator = new FakeListChatModel({responses: [JSON.stringify(FRACTIONAL_MAGAZINE)]});
  const invoke = vi.spyOn(generator, "invoke");
  const weaponPipelineDependencies: WeaponPipelineDependencies = {
    ...weaponPipelineDependenciesWhereGeneratorSays(),
    generator,
  };

  const outcome = await generateWeapon({prompt: "a rifle"}, weaponPipelineDependencies);

  expect(outcome.status).toBe("invalid");
  expect(outcome.weapon).toBeUndefined();
  expect(invoke).toHaveBeenCalledTimes(2);
});

it("is invalid when the generator gives nothing at all, twice", async () => {
  const generator = new FakeListChatModel({responses: ["no weapon for you"]});
  const weaponPipelineDependencies: WeaponPipelineDependencies = {
    ...weaponPipelineDependenciesWhereGeneratorSays(),
    generator,
  };
  const appearanceCall = vi.spyOn(weaponPipelineDependencies.appearanceGenerator, "invoke");

  const outcome = await generateWeapon({prompt: "a rifle"}, weaponPipelineDependencies);

  expect(outcome.status).toBe("invalid");
  expect(outcome.modelCalls).toBe(3);
  expect(outcome.appearance).toBeUndefined();
  expect(appearanceCall).not.toHaveBeenCalled();
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

function weaponPipelineDependenciesWhereDrawerSays(...drawings: unknown[]): WeaponPipelineDependencies {
  return {
    ...weaponPipelineDependenciesWhereGeneratorSays(RIFLE),
    appearanceGenerator: appearanceModelSaying(...drawings),
  };
}

function weaponPipelineDependenciesWhereGeneratorSays(...replies: unknown[]): WeaponPipelineDependencies {
  return {
    generator: new FakeListChatModel({responses: replies.map(reply => JSON.stringify(reply))}),
    moderator: new FakeListChatModel({responses: [JSON.stringify({isWeaponRequest: true, reason: "a gun"})]}),
    appearanceGenerator: appearanceModelSaying(passingAppearance()),
  };
}

function fakeWeaponPipelineDependencies(): WeaponPipelineDependencies {
  return {
    generator: new FakeListChatModel({responses: ["{}"]}),
    moderator: new FakeListChatModel({responses: ["{}"]}),
    appearanceGenerator: appearanceModelSaying(passingAppearance()),
  };
}

/** What a model that draws would write: the answers, one per call, the last repeated. */
function appearanceModelSaying(...answers: unknown[]): ToolCallingFakeModel {
  return new ToolCallingFakeModel({answers});
}
