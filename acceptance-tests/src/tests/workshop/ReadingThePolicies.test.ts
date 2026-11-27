import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

given("a guest opens the workshop", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.workshop.open();
  });

  then("browser-local Make has no provider notice", async ({gunsmith}) => {
    expect(await gunsmith.workshop.getMakePrivacyNotice()).toBeUndefined();
  });

  when("they follow the terms link before signing in", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.workshop.followPolicyLink("Terms of Service");
    });

    then("they can read the Terms of Service without signing in", async ({gunsmith}) => {
      expect(await gunsmith.workshop.getPolicyHeading()).toBe("Terms of Service");
    });
  });
});

given("a signed-in player opens the weapon workshop", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.workshop.arrangeSignedInWeapon();
    await gunsmith.workshop.open();
  });

  then("they see that Make sends and may keep their prompt before making a weapon", async ({gunsmith}) => {
    await expect.poll(() => gunsmith.workshop.getMakePrivacyNotice()).toContain("AI provider");
    expect(await gunsmith.workshop.getMakePrivacyNotice()).toContain("we keep it with your prompt");
  });

  when("they follow the privacy link before making a weapon", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.workshop.followPolicyLink("Privacy Policy");
    });

    then("they can read the Privacy Policy", async ({gunsmith}) => {
      expect(await gunsmith.workshop.getPolicyHeading()).toBe("Privacy Policy");
    });
  });
});

given("a signed-in player opens the arena workshop", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.workshop.arenas.arrangeSignedInArena();
    await gunsmith.workshop.open();
    await gunsmith.workshop.arenas.open();
  });

  then("they see the provider and storage notice before making an arena", async ({gunsmith}) => {
    await expect.poll(() => gunsmith.workshop.getMakePrivacyNotice()).toContain("AI provider");
    expect(await gunsmith.workshop.getMakePrivacyNotice()).toContain("we keep it with your prompt");
  });
});
