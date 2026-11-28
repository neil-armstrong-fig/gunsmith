import {createArenaModels} from "@gunsmith/ai/adapter/arena/CreateArenaModels";
import type {ArenaModels} from "@gunsmith/ai/adapter/arena/types/ArenaModels";
import {generateArena} from "@gunsmith/ai/pipeline/arena/GenerateArena";
import type {ArenaOutcome} from "@gunsmith/ai/pipeline/arena/types/ArenaOutcome";
import {workerEnvironment} from "@src/env/WorkerEnvironment";
import {isArenaPipelineAvailable} from "@src/router/routes/arenas/pipeline/IsArenaPipelineAvailable";
import {runArenaPipeline} from "@src/router/routes/arenas/pipeline/RunArenaPipeline";

vi.unmock("@src/router/routes/arenas/pipeline/IsArenaPipelineAvailable");
vi.unmock("@src/router/routes/arenas/pipeline/RunArenaPipeline");
vi.mock("@gunsmith/ai/pipeline/arena/GenerateArena");
vi.mock("@gunsmith/ai/adapter/arena/CreateArenaModels");

const models = {generator: "the drawing model", moderator: "the judging model"} as unknown as ArenaModels;
const outcome = {status: "rejected", reason: "not an arena"} as unknown as ArenaOutcome;

beforeEach(() => {
  vi.mocked(createArenaModels).mockReturnValue(models);
  vi.mocked(generateArena).mockResolvedValue(outcome);
});

it("is available only once the Worker has the model key", () => {
  expect(isArenaPipelineAvailable()).toBe(false);

  workerEnvironment.ANTHROPIC_API_KEY = "sk-test-key";

  expect(isArenaPipelineAvailable()).toBe(true);
});

it("is not available when the model key is empty", () => {
  workerEnvironment.ANTHROPIC_API_KEY = "";

  expect(isArenaPipelineAvailable()).toBe(false);
});

it("runs the AI pipeline on the prompt and the signal, with models built from the Worker's key", async () => {
  workerEnvironment.ANTHROPIC_API_KEY = "sk-test-key";
  const signal = new AbortController().signal;

  const answer = await runArenaPipeline("  a maze ", signal);

  expect(answer).toBe(outcome);
  expect(createArenaModels).toHaveBeenCalledWith({apiKey: "sk-test-key"});
  expect(generateArena).toHaveBeenCalledWith({prompt: "  a maze ", signal}, models);
});

it("hands the AI pipeline the style the player chose", async () => {
  workerEnvironment.ANTHROPIC_API_KEY = "sk-test-key";
  const signal = new AbortController().signal;

  await runArenaPipeline("a maze", signal, "red");

  expect(generateArena).toHaveBeenCalledWith({prompt: "a maze", signal, style: "red"}, models);
});

it("builds its models for each request, reading the key where it is used", async () => {
  workerEnvironment.ANTHROPIC_API_KEY = "sk-first-key";
  await runArenaPipeline("a maze", new AbortController().signal);
  workerEnvironment.ANTHROPIC_API_KEY = "sk-second-key";
  await runArenaPipeline("a maze", new AbortController().signal);

  expect(vi.mocked(createArenaModels).mock.calls).toEqual([[{apiKey: "sk-first-key"}], [{apiKey: "sk-second-key"}]]);
});

it("fails the request when the pipeline fails", async () => {
  workerEnvironment.ANTHROPIC_API_KEY = "sk-test-key";
  vi.mocked(generateArena).mockRejectedValue(new Error("the model call was cancelled"));

  await expect(runArenaPipeline("a maze", new AbortController().signal)).rejects.toThrow(
    "the model call was cancelled",
  );
});

it("calls no model and fails when the key is missing", async () => {
  await expect(runArenaPipeline("a maze", new AbortController().signal)).rejects.toThrow();

  expect(createArenaModels).not.toHaveBeenCalled();
  expect(generateArena).not.toHaveBeenCalled();
});
