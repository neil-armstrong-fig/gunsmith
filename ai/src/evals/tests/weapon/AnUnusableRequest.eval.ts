import {beforeAll, given, thenExpect, when} from "@evals/eval-criteria-mapping/EvalCriteriaMapping";

// The token pre-check runs before any model, so these cost nothing: no moderation call, no generation.
given("a player sends the weapon smith a request that the pre-check turns away before any model is called", () => {
  // Nothing to read, so rejected before any model is called.
  when("the player sends a request that is only whitespace", ({weaponSmith}) => {
    beforeAll(() => weaponSmith.ask("   "));

    thenExpect("the weapon smith rejects the request", () => weaponSmith.expectRejected());

    thenExpect("the request costs no model call", () => weaponSmith.expectModelCallsAtMost(0));
  });

  // Far over the length limit, so rejected before any model is called.
  when(
    "the player sends a request far over the length limit: 'a very large rifle.' repeated 200 times",
    ({weaponSmith}) => {
      beforeAll(() => weaponSmith.ask("a very large rifle. ".repeat(200)));

      thenExpect("the weapon smith rejects the request", () => weaponSmith.expectRejected());

      thenExpect("the request costs no model call", () => weaponSmith.expectModelCallsAtMost(0));
    },
  );
});
