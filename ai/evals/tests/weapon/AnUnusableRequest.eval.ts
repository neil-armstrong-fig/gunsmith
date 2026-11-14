import {beforeAll, given, thenExpect, when} from "@evals/eval-criteria-mapping/EvalCriteriaMapping";

// The token pre-check runs before any model, so these cost nothing: no moderation call, no generation.
given("a player sends a request that cannot be used", () => {
  // Nothing to read, so rejected before any model is called.
  when("they send only whitespace", ({weaponSmith}) => {
    beforeAll(() => weaponSmith.ask("   "));

    thenExpect("the request is rejected", () => weaponSmith.expectRejected());

    thenExpect("no model is called", () => weaponSmith.expectModelCallsAtMost(0));
  });

  // Far over the length limit, so rejected before any model is called.
  when("they send a request far over the length limit", ({weaponSmith}) => {
    beforeAll(() => weaponSmith.ask("a very large rifle. ".repeat(200)));

    thenExpect("the request is rejected", () => weaponSmith.expectRejected());

    thenExpect("no model is called", () => weaponSmith.expectModelCallsAtMost(0));
  });
});
