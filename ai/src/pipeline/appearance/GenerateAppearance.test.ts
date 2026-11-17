import {fallbackAppearance} from "@gunsmith/shared/appearance/fallback/FallbackAppearance";
import {generateAppearance} from "@gunsmith/ai/pipeline/appearance/GenerateAppearance";
import {passingAppearance} from "@gunsmith/ai/pipeline/appearance/testing/PassingAppearance";
import {ToolCallingFakeModel} from "@gunsmith/ai/pipeline/appearance/testing/ToolCallingFakeModel";

const USAGE = {inputTokens: 100, outputTokens: 200};
const PROMPT = {prompt: "a rubber duck cannon"};

/** What a model really wrote on the local tier: nested text, and no opacity, rotation or origin on any part. */
function sloppyAnswer(): Record<string, unknown> {
  return {body: JSON.stringify([{kind: "rect", x: 12, y: 26, width: 40, height: 12}])};
}

/** A drawing the strict check refuses: a part reaching outside the canvas. */
function refusedAnswer(): Record<string, unknown> {
  return {...passingAppearance(), body: [{kind: "rect", x: 60, y: 10, width: 20, height: 5}]};
}

it("shows the first drawing as written when it passes, after one model call", async () => {
  const model = new ToolCallingFakeModel({answers: [passingAppearance()], usage: USAGE});

  const outcome = await generateAppearance(PROMPT, {generator: model});

  expect(outcome).toEqual({
    status: "valid",
    appearance: passingAppearance(),
    changes: [],
    errors: [],
    nodes: ["generate", "fix", "validate"],
    modelCalls: 1,
    usage: USAGE,
  });
});

it("accepts a first drawing the code could finish, and says what it did", async () => {
  const model = new ToolCallingFakeModel({answers: [sloppyAnswer()], usage: USAGE});

  const outcome = await generateAppearance(PROMPT, {generator: model});

  expect(outcome.status).toBe("completed");
  expect(outcome.modelCalls).toBe(1);
  expect(outcome.nodes).toEqual(["generate", "fix", "validate"]);
  expect(outcome.changes).toContain("body");
  expect(outcome.changes).toContain("body.opacity");
});

it("asks for one repair when the first drawing is refused, showing the model the faults and its own answer", async () => {
  const model = new ToolCallingFakeModel({answers: [refusedAnswer(), passingAppearance()], usage: USAGE});

  const outcome = await generateAppearance(PROMPT, {generator: model});

  const sent = (model.seen[1] ?? []).map(message => String(message.content));
  expect(outcome.status).toBe("repaired");
  expect(outcome.appearance).toEqual(passingAppearance());
  expect(outcome.nodes).toEqual(["generate", "fix", "validate", "repair", "fix", "validate"]);
  expect(outcome.modelCalls).toBe(2);
  expect(sent.some(text => text.startsWith("<problems>") && text.includes("reaches outside"))).toBe(true);
  expect(sent.some(text => text.startsWith("<previous>"))).toBe(true);
});

it("keeps what the first drawing was refused for, so a report can say what the repair fixed", async () => {
  const model = new ToolCallingFakeModel({answers: [refusedAnswer(), passingAppearance()], usage: USAGE});

  const outcome = await generateAppearance(PROMPT, {generator: model});

  expect(outcome.firstErrors?.some(error => error.includes("reaches outside"))).toBe(true);
});

it("keeps them when the stand-in is shown too", async () => {
  const model = new ToolCallingFakeModel({answers: [refusedAnswer()], usage: USAGE});

  const outcome = await generateAppearance(PROMPT, {generator: model});

  expect(outcome.status).toBe("fallback");
  expect(outcome.firstErrors?.some(error => error.includes("reaches outside"))).toBe(true);
});

it("adds up what both calls cost", async () => {
  const model = new ToolCallingFakeModel({answers: [refusedAnswer(), passingAppearance()], usage: USAGE});

  const outcome = await generateAppearance(PROMPT, {generator: model});

  expect(outcome.usage).toEqual({inputTokens: 200, outputTokens: 400});
});

it("repairs after a first call that answered nothing", async () => {
  const model = new ToolCallingFakeModel({answers: [undefined, passingAppearance()], usage: USAGE});

  const outcome = await generateAppearance(PROMPT, {generator: model});

  expect(outcome.status).toBe("repaired");
  expect(outcome.modelCalls).toBe(2);
});

it("falls back to the plain stand-in when the repair is refused too, and says what was still wrong", async () => {
  const model = new ToolCallingFakeModel({answers: [refusedAnswer()], usage: USAGE});

  const outcome = await generateAppearance(PROMPT, {generator: model});

  expect(outcome.status).toBe("fallback");
  expect(outcome.appearance).toEqual(fallbackAppearance());
  expect(outcome.nodes).toEqual(["generate", "fix", "validate", "repair", "fix", "validate", "fallback"]);
  expect(outcome.modelCalls).toBe(2);
  expect(outcome.errors).toEqual([expect.stringContaining("reaches outside")]);
});

it("reports what was wrong with the repair, not with the first drawing, when it falls back", async () => {
  const model = new ToolCallingFakeModel({answers: [refusedAnswer(), {...passingAppearance(), version: 2}]});

  const outcome = await generateAppearance(PROMPT, {generator: model});

  expect(outcome.status).toBe("fallback");
  expect(outcome.errors).toEqual([expect.stringContaining("version:")]);
});

it("never asks a third time", async () => {
  const model = new ToolCallingFakeModel({answers: [refusedAnswer()]});

  await generateAppearance(PROMPT, {generator: model});

  expect(model.seen).toHaveLength(2);
});

it("reports no errors and no fallback nodes for a drawing that passed", async () => {
  const model = new ToolCallingFakeModel({answers: [refusedAnswer(), passingAppearance()]});

  const outcome = await generateAppearance(PROMPT, {generator: model});

  expect(outcome.errors).toEqual([]);
  expect(outcome.nodes).not.toContain("fallback");
});

it("what the repair changed is reported as the code's work on the repair, not the first answer's", async () => {
  const model = new ToolCallingFakeModel({answers: [refusedAnswer(), sloppyAnswer()]});

  const outcome = await generateAppearance(PROMPT, {generator: model});

  expect(outcome.status).toBe("repaired");
  expect(outcome.changes).toContain("body.opacity");
});
