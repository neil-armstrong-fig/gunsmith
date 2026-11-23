import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

const PROMPT = "a mint coil weapon";
const VISION = {degrees: 110, range: 15};

given("a signed-in player makes, tries and saves a weapon, then reloads", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.workshop.arrangeSignedInWeapon();
    await gunsmith.workshop.open();
    await gunsmith.workshop.pasteThePrompt(PROMPT);
    await gunsmith.workshop.make();
    await expect.poll(async () => (await gunsmith.workshop.getResult()).name).toBe("Mint Coil");
    const result = await gunsmith.workshop.getResult();
    expect(result.pictureAddress).toContain("data:image/svg+xml");
    expect(result.stats.Vision).toBe("110° out to 15 tiles");

    await gunsmith.workshop.tryIt();
    await gunsmith.weapon.waitForSlot(2);
    expect(await gunsmith.vision.getView()).toEqual(VISION);
    await expect.poll(() => gunsmith.player.hasHeldWeaponAccent("mint")).toBe(true);

    await gunsmith.workshop.open();
    await gunsmith.workshop.shelf.save();
    await expect.poll(() => gunsmith.workshop.shelf.isSaved()).toBe(true);
    await gunsmith.reloadThePage();
    await gunsmith.workshop.open();
    await expect.poll(() => gunsmith.workshop.shelf.getItems()).toMatchObject([{name: "Mint Coil", prompt: PROMPT}]);
    await gunsmith.workshop.shelf.tryItem(0);
  });

  then("the account shelf restores the generated weapon, vision and drawing", async ({gunsmith}) => {
    await gunsmith.weapon.waitForSlot(2);
    expect(await gunsmith.vision.getView()).toEqual(VISION);
    await expect.poll(() => gunsmith.player.hasHeldWeaponAccent("mint")).toBe(true);
    expect((await gunsmith.hud.getInventoryIconLook(2)).mintPixels).toBeGreaterThan(0);
  });
});

given("a signed-in player's one-place shelf holds a weapon saved before vision stats", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.workshop.arrangeSignedInWeapon("full");
    await gunsmith.workshop.open();
  });

  when("they try the old weapon", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.workshop.shelf.tryItem(0);
    });

    then("it uses the rifle's vision", async ({gunsmith}) => {
      await gunsmith.weapon.waitForSlot(2);
      expect(await gunsmith.vision.getView()).toEqual({degrees: 90, range: 12});
      expect((await gunsmith.hud.getInventory()).selectedName).toBe("Old Coil");
    });
  });

  when("they save a new weapon", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.workshop.pasteThePrompt(PROMPT);
      await gunsmith.workshop.make();
      await gunsmith.workshop.shelf.save();
      await expect.poll(() => gunsmith.workshop.shelf.getSaveError()).toContain("Your weapon shelf is full");
    });

    then("the account limit and the existing weapon are still shown", async ({gunsmith}) => {
      expect(await gunsmith.workshop.shelf.getMeter()).toEqual({count: 1, limit: 1});
      expect(await gunsmith.workshop.shelf.getItems()).toMatchObject([{name: "Old Coil"}]);
    });

    when("they delete the old weapon and save again", () => {
      beforeEach(async ({gunsmith}) => {
        await gunsmith.workshop.shelf.deleteItem(0);
        await expect.poll(() => gunsmith.workshop.shelf.getItems()).toEqual([]);
        await gunsmith.workshop.shelf.save();
      });

      then("the generated weapon fills the place they freed", async ({gunsmith}) => {
        await expect.poll(() => gunsmith.workshop.shelf.getItems()).toMatchObject([{name: "Mint Coil"}]);
      });
    });
  });
});
