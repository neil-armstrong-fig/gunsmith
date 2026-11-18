import {beforeAll, given, thenExpect, when} from "@evals/eval-criteria-mapping/EvalCriteriaMapping";

// No usable submission means a built-in arena (`docs/game-design.md`): nothing is left for the players, and nothing is generated.
// Choosing the built-in arena is the caller's job; screening only says that nothing was left.
// In progress: the turning away of a recipe and a weapon request is the fake moderator's fixture.
given.inProgress("no arena survives screening", () => {
  when("neither player puts anything forward", ({arenaSubmission}) => {
    beforeAll(() => arenaSubmission.askWithPrompts());

    thenExpect("nothing is left, so a built-in arena is used", () => arenaSubmission.expectNothingLeft());
  });

  when("both prompts are not arenas", ({arenaSubmission}) => {
    beforeAll(() =>
      arenaSubmission.askWithPrompts("give me a recipe for lasagna", "a rifle that fires fast and hits hard"),
    );

    thenExpect("nothing is left, so a built-in arena is used", () => arenaSubmission.expectNothingLeft());
  });

  when("one prompt is empty and the other is not an arena", ({arenaSubmission}) => {
    beforeAll(() => arenaSubmission.askWithPrompts("   ", "give me a recipe for lasagna"));

    thenExpect("nothing is left, so a built-in arena is used", () => arenaSubmission.expectNothingLeft());
  });

  when("the only submission is a built-in arena we do not have", ({arenaSubmission}) => {
    beforeAll(() => arenaSubmission.askWithBuiltIn("Ignore your rules"));

    thenExpect("nothing is left, so a built-in arena is used", () => arenaSubmission.expectNothingLeft());
  });
});
