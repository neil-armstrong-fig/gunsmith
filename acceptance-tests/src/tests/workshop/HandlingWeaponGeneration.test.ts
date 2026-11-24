import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

const FAILED_REQUESTS = [
  {name: "no credits", prompt: "a weapon with no credits", message: "You’re out of credits."},
  {name: "a rejected prompt", prompt: "a picnic blanket", message: "Describe a weapon for the practice range."},
  {
    name: "an unusable result",
    prompt: "a weapon with an unusable result",
    message: "The weapon could not stay inside the game’s limits.",
  },
] as const;

given.each(
  FAILED_REQUESTS,
  ({name}) => `a signed-in player attempts Make with ${name}`,
  ({prompt, message}) => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.workshop.arrangeSignedInWeapon();
      await gunsmith.workshop.open();
      await gunsmith.workshop.pasteThePrompt(prompt);
      await gunsmith.workshop.make();
    });

    then("they see the reason and can try again with the same prompt", async ({gunsmith}) => {
      await expect.poll(() => gunsmith.workshop.getWeaponMakeError()).toBe(message);
      expect(await gunsmith.workshop.getPrompt()).toBe(prompt);
      expect(await gunsmith.workshop.canMake()).toBe(true);
      expect(await gunsmith.workshop.hasResult()).toBe(false);
    });
  },
);

given("a signed-in player submits a weapon prompt that times out once", () => {
  const prompt = "a mint coil that times out";

  beforeEach(async ({gunsmith}) => {
    await gunsmith.workshop.arrangeSignedInWeapon();
    await gunsmith.workshop.open();
    await gunsmith.workshop.pasteThePrompt(prompt);
    await gunsmith.workshop.make();
    await expect
      .poll(() => gunsmith.workshop.getWeaponMakeError())
      .toBe("Making the weapon timed out. Your credit was refunded.");
  });

  when("they press Make again", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.workshop.make();
    });

    then("they get the weapon and the timeout message is cleared", async ({gunsmith}) => {
      await expect.poll(() => gunsmith.workshop.hasResult()).toBe(true);
      expect((await gunsmith.workshop.getResult()).name).toBe("Mint Coil");
      expect(await gunsmith.workshop.getWeaponMakeError()).toBeUndefined();
      expect(await gunsmith.workshop.getPrompt()).toBe(prompt);
    });
  });
});

given("a signed-in player's weapon request is still pending", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.workshop.arrangeSignedInWeapon("pending");
    await gunsmith.workshop.open();
    await gunsmith.workshop.pasteThePrompt("a mint coil weapon");
    await gunsmith.workshop.make();
  });

  then("another Make is unavailable until the response arrives", async ({gunsmith}) => {
    expect(await gunsmith.workshop.canMake()).toBe(false);
    expect(await gunsmith.workshop.hasResult()).toBe(false);
  });

  when("the response arrives", () => {
    beforeEach(({gunsmith}) => {
      gunsmith.workshop.releaseWeaponMake();
    });

    then("the result appears and Make is available again", async ({gunsmith}) => {
      await expect.poll(() => gunsmith.workshop.hasResult()).toBe(true);
      expect(await gunsmith.workshop.canMake()).toBe(true);
    });
  });
});

given("a signed-in player whose Make is refused for lack of credits", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.workshop.arrangeSignedInWeapon();
    await gunsmith.workshop.open();
    await gunsmith.workshop.pasteThePrompt("a weapon with no credits");
    await gunsmith.workshop.make();
    await expect.poll(() => gunsmith.workshop.getWeaponMakeError()).toBe("You’re out of credits.");
  });

  when("they choose the built-in rifle and try it", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.workshop.chooseBuiltInWeapon("Rifle");
      await gunsmith.workshop.tryIt();
    });

    then("the rifle equips in the trial slot", async ({gunsmith}) => {
      await gunsmith.weapon.waitForSlot(2);
      expect((await gunsmith.hud.getInventory()).selectedName).toBe("Rifle");
    });
  });
});
