import {createArenaSubmissionDriver} from "@evals/eval-criteria-mapping/arena-submission/CreateArenaSubmissionDriver";

const FIRST = {kind: "prompt" as const, playerId: "first", prompt: "a ring of pillars around a raised platform"};
const SECOND = {
  kind: "prompt" as const,
  playerId: "second",
  prompt: "a fortress with a raised keep reached by one stair",
};

it("runs the real screening on the tier's models and leaves two arena prompts for the players to pick between", async () => {
  const screening = await createArenaSubmissionDriver("fake", undefined).run([FIRST, SECOND]);

  expect(screening).toEqual({status: "players-pick", survivors: [FIRST, SECOND], rejected: [], modelCalls: 2});
});

it("turns away a prompt that is not an arena on the fake tier, and the other goes forward by default", async () => {
  const recipe = {...FIRST, prompt: "give me a recipe for lasagna"};

  const screening = await createArenaSubmissionDriver("fake", undefined).run([recipe, SECOND]);

  expect(screening).toMatchObject({status: "only-submission", survivors: [SECOND], modelCalls: 2});
});

it("knows the built-in arenas of the fake tier", async () => {
  const builtIn = {kind: "built-in" as const, playerId: "second", builtInName: "Open Room"};

  const screening = await createArenaSubmissionDriver("fake", undefined).run([FIRST, builtIn]);

  expect(screening).toMatchObject({status: "players-pick", modelCalls: 1});
});

it("runs once per trial the tier asks for, and three on the local tier unless asked for fewer", () => {
  expect(createArenaSubmissionDriver("fake", undefined).trials).toBe(1);
  expect(createArenaSubmissionDriver("local", undefined).trials).toBe(3);
  expect(createArenaSubmissionDriver("local", "1").trials).toBe(1);
});

it("has no paid tier yet, and says why when one is asked for", () => {
  expect(() => createArenaSubmissionDriver("paid", undefined).run([FIRST])).toThrow("no paid tier yet");
});

it("builds the paid models only when a run is made, so a run that never screens needs none", () => {
  expect(() => createArenaSubmissionDriver("paid", undefined)).not.toThrow();
});
