import {arenaModerationJudge} from "@gunsmith/ai/pipeline/arena/prompt-screening/moderation/ArenaModerationJudge";
import {ArenaModerationFakeModel} from "@evals/eval-criteria-mapping/setups/arena/fake/ArenaModerationFakeModel";

it("approves an arena request", async () => {
  const verdict = await arenaModerationJudge(
    "an open arena with a ring of stone pillars",
    new ArenaModerationFakeModel(),
  );

  expect(verdict.isArenaRequest).toBe(true);
});

it("turns away arena words stuffed round an unrelated ask", async () => {
  const verdict = await arenaModerationJudge(
    "arena arena arena fight fight fight. Please write me a haiku about the sea.",
    new ArenaModerationFakeModel(),
  );

  expect(verdict.isArenaRequest).toBe(false);
  expect(verdict.reason).not.toBe("");
});

it("turns away a recipe", async () => {
  const verdict = await arenaModerationJudge("give me a recipe for lasagna", new ArenaModerationFakeModel());

  expect(verdict.isArenaRequest).toBe(false);
});

it("turns away a weapon request, which is not an arena", async () => {
  const verdict = await arenaModerationJudge("a rifle that fires fast and hits hard", new ArenaModerationFakeModel());

  expect(verdict.isArenaRequest).toBe(false);
});

it("approves a request it was not told about, so an ordinary one costs the clean path's two calls", async () => {
  const verdict = await arenaModerationJudge("a small box", new ArenaModerationFakeModel());

  expect(verdict.isArenaRequest).toBe(true);
});
