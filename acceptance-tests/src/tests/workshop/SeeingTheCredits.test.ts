import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

given("a signed-in player with 7 of 10 credits opens the workshop", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.workshop.arrangeSignedInWeapon();
    await gunsmith.workshop.arrangeCredits(7);
    await gunsmith.workshop.open();
  });

  then("they see how many credits are left today and what a Make costs", async ({gunsmith}) => {
    await expect.poll(() => gunsmith.workshop.getCredits()).toBe("7 of 10 credits left today · Make costs 1 credit");
  });

  when("they make a weapon", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.workshop.pasteThePrompt("a mint coil weapon");
      await gunsmith.workshop.make();
      await expect.poll(() => gunsmith.workshop.hasResult()).toBe(true);
    });

    then("the balance shows the credit spent", async ({gunsmith}) => {
      await expect.poll(() => gunsmith.workshop.getCredits()).toBe("6 of 10 credits left today · Make costs 1 credit");
    });
  });
});

given("a signed-in player with 7 of 10 credits makes an arena", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.workshop.arenas.arrangeSignedInArena();
    await gunsmith.workshop.arrangeCredits(7);

    await gunsmith.workshop.open();
    await gunsmith.workshop.arenas.open();
    await gunsmith.workshop.pasteThePrompt("a wide industrial yard");
    await gunsmith.workshop.make();
    await expect.poll(() => gunsmith.workshop.arenas.hasResult()).toBe(true);
  });

  then("the balance shows the credit spent", async ({gunsmith}) => {
    await expect.poll(() => gunsmith.workshop.getCredits()).toBe("6 of 10 credits left today · Make costs 1 credit");
  });
});

given("a guest opens the workshop", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.workshop.open();
    await expect.poll(() => gunsmith.workshop.isSignInOfferedAboveThePrompt()).toBe(true);
  });

  then("no credit balance is shown", async ({gunsmith}) => {
    expect(await gunsmith.workshop.getCredits()).toBeUndefined();
  });
});
