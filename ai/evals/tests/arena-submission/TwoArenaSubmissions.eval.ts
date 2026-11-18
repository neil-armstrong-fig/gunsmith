import {beforeAll, given, thenExpect, when} from "@evals/eval-criteria-mapping/EvalCriteriaMapping";

// Both players put an arena forward, and the players pick between them (`docs/game-design.md`): screening only checks that each is
// a request for an arena, or a built-in one that exists, and leaves both for the players. Nothing here says which is better. That each
// survivor is a submission that was made, word for word, that screening cost at most a moderation call for each prompt, and that
// nothing leaks, are the DSL's standing criteria, which the mapping adds under every `when`.
// In progress: the fake moderator approves any prompt it was not told about; whether a real model approves real arena prompts is for
// the local tier.
given.inProgress("both players put an arena forward", () => {
  when("both describe an arena", ({arenaSubmission}) => {
    beforeAll(() =>
      arenaSubmission.askWithPrompts(
        "an open arena with a ring of stone pillars",
        "a fortress with a raised keep reached by one stair",
      ),
    );

    thenExpect("the players pick between the two", () => arenaSubmission.expectPlayersPick());
  });

  when("one describes an arena and the other names a built-in arena", ({arenaSubmission}) => {
    beforeAll(() =>
      arenaSubmission.askWithPromptAndBuiltIn(
        "a courtyard split by a low wall, with crates to hide behind",
        "Open Room",
      ),
    );

    thenExpect("the players pick between the two, and the built-in arena costs no model call", () =>
      arenaSubmission.expectPlayersPick(),
    );
  });
});
