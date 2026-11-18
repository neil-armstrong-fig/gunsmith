import {createLocalChatModel} from "@evals/eval-criteria-mapping/environment/tier/local/CreateLocalChatModel";

it("is a model on the local Ollama, the one the local tier has always used", () => {
  vi.stubEnv("EVAL_LOCAL_MODEL", undefined);

  const model = createLocalChatModel({temperature: 0, numPredict: 100});

  expect(model.model).toBe("qwen3.5:9b");
  expect(model.baseUrl).toBe("http://127.0.0.1:11434");
  onTestFinished(() => {
    vi.unstubAllEnvs();
  });
});

it("is the model EVAL_LOCAL_MODEL names, when it names one", () => {
  vi.stubEnv("EVAL_LOCAL_MODEL", "tiny:1b");
  onTestFinished(() => {
    vi.unstubAllEnvs();
  });

  expect(createLocalChatModel({temperature: 0, numPredict: 100}).model).toBe("tiny:1b");
});

it("keeps the temperature and the length each domain asks for, because they differ on purpose", () => {
  const drawing = createLocalChatModel({temperature: 0.7, numPredict: 3000});

  expect(drawing.temperature).toBe(0.7);
  expect(drawing.numPredict).toBe(3000);
});
