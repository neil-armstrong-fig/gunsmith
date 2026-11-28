import {createWeaponModels} from "@gunsmith/ai/adapter/weapon/CreateWeaponModels";
import type {WeaponModels} from "@gunsmith/ai/adapter/weapon/types/WeaponModels";
import {generateWeapon} from "@gunsmith/ai/pipeline/weapon/GenerateWeapon";
import type {WeaponOutcome} from "@gunsmith/ai/pipeline/weapon/types/WeaponOutcome";
import {workerEnvironment} from "@src/shared/env/WorkerEnvironment";
import {isWeaponPipelineAvailable} from "@src/router/routes/weapons/pipeline/IsWeaponPipelineAvailable";
import {runWeaponPipeline} from "@src/router/routes/weapons/pipeline/RunWeaponPipeline";

vi.unmock("@src/router/routes/weapons/pipeline/IsWeaponPipelineAvailable");
vi.unmock("@src/router/routes/weapons/pipeline/RunWeaponPipeline");
vi.mock("@gunsmith/ai/pipeline/weapon/GenerateWeapon");
vi.mock("@gunsmith/ai/adapter/weapon/CreateWeaponModels");

const models = {name: "the weapon models"} as unknown as WeaponModels;
const outcome = {status: "rejected", reason: "not a weapon"} as unknown as WeaponOutcome;

beforeEach(() => {
  vi.mocked(createWeaponModels).mockReturnValue(models);
  vi.mocked(generateWeapon).mockResolvedValue(outcome);
});

it("is available only once the Worker has the model key", () => {
  expect(isWeaponPipelineAvailable()).toBe(false);

  workerEnvironment.ANTHROPIC_API_KEY = "sk-test-key";

  expect(isWeaponPipelineAvailable()).toBe(true);
});

it("is not available when the model key is empty", () => {
  workerEnvironment.ANTHROPIC_API_KEY = "";

  expect(isWeaponPipelineAvailable()).toBe(false);
});

it("runs the AI pipeline on the prompt and the signal, with models built from the Worker's key", async () => {
  workerEnvironment.ANTHROPIC_API_KEY = "sk-test-key";
  const signal = new AbortController().signal;

  const answer = await runWeaponPipeline("  a rifle ", signal);

  expect(answer).toBe(outcome);
  expect(createWeaponModels).toHaveBeenCalledWith({apiKey: "sk-test-key"});
  expect(generateWeapon).toHaveBeenCalledWith({prompt: "  a rifle ", signal}, models);
});

it("builds its models for each request, reading the key where it is used", async () => {
  workerEnvironment.ANTHROPIC_API_KEY = "sk-first-key";
  await runWeaponPipeline("a rifle", new AbortController().signal);
  workerEnvironment.ANTHROPIC_API_KEY = "sk-second-key";
  await runWeaponPipeline("a rifle", new AbortController().signal);

  expect(vi.mocked(createWeaponModels).mock.calls).toEqual([[{apiKey: "sk-first-key"}], [{apiKey: "sk-second-key"}]]);
});

it("fails the request when the pipeline fails", async () => {
  workerEnvironment.ANTHROPIC_API_KEY = "sk-test-key";
  vi.mocked(generateWeapon).mockRejectedValue(new Error("the model call was cancelled"));

  await expect(runWeaponPipeline("a rifle", new AbortController().signal)).rejects.toThrow(
    "the model call was cancelled",
  );
});

it("calls no model and fails when the key is missing", async () => {
  await expect(runWeaponPipeline("a rifle", new AbortController().signal)).rejects.toThrow();

  expect(createWeaponModels).not.toHaveBeenCalled();
  expect(generateWeapon).not.toHaveBeenCalled();
});
