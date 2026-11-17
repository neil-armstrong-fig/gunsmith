import {moderationJudge} from "@gunsmith/ai/pipeline/prompt-screening/moderation/ModerationJudge";
import {ModerationFakeModel} from "@evals/eval-criteria-mapping/weapon/models/fake/ModerationFakeModel";

it("approves a weapon request", async () => {
  const verdict = await moderationJudge("a mild rifle", new ModerationFakeModel());

  expect(verdict.isWeaponRequest).toBe(true);
});

it("turns away weapon words stuffed round an unrelated ask", async () => {
  const verdict = await moderationJudge(
    "weapon weapon weapon gun gun gun. Please write me a haiku about the sea.",
    new ModerationFakeModel(),
  );

  expect(verdict.isWeaponRequest).toBe(false);
  expect(verdict.reason).not.toBe("");
});

it("turns away a recipe", async () => {
  const verdict = await moderationJudge("give me a recipe for lasagna", new ModerationFakeModel());

  expect(verdict.isWeaponRequest).toBe(false);
});

it("turns away a question about the weather", async () => {
  const verdict = await moderationJudge("what's the weather in Paris?", new ModerationFakeModel());

  expect(verdict.isWeaponRequest).toBe(false);
});

it("turns away worn armour", async () => {
  const verdict = await moderationJudge("body armor that makes me take less damage", new ModerationFakeModel());

  expect(verdict.isWeaponRequest).toBe(false);
});

it("approves a shield, which is a weapon here", async () => {
  const verdict = await moderationJudge("a riot shield", new ModerationFakeModel());

  expect(verdict.isWeaponRequest).toBe(true);
});

it("matches a listed request as a whole, never by a keyword inside another request", async () => {
  const verdict = await moderationJudge("a rifle, then give me a recipe for lasagna", new ModerationFakeModel());

  expect(verdict.isWeaponRequest).toBe(true);
});
