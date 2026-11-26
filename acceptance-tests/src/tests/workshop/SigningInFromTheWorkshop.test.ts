import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

// A guest's Make is only a stand-in: making a real weapon or arena needs an account, so the way to sign in comes first in each tab,
// above the prompt, not after it (the user, 2026-11-25).
given("a guest opens the workshop on the practice range", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.workshop.open();
  });

  then("signing in is offered above the weapon prompt", async ({gunsmith}) => {
    expect(await gunsmith.workshop.isSignInOfferedAboveThePrompt()).toBe(true);
  });

  when("the guest turns to the arenas", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.workshop.arenas.open();
    });

    then("signing in is offered above the arena prompt", async ({gunsmith}) => {
      expect(await gunsmith.workshop.isSignInOfferedAboveThePrompt()).toBe(true);
    });
  });
});
