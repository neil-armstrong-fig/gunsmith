import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

given("the practice range opened without a startup override", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.menu.loadWithoutOverride();
  });

  then("the Game menu is open on startup", async ({gunsmith}) => {
    expect(await gunsmith.menu.isOpen()).toBe(true);
  });

  then("Workshop is the second action, directly below Resume", async ({gunsmith}) => {
    expect((await gunsmith.menu.getMainActions()).slice(0, 2)).toEqual(["Resume", "Workshop"]);
  });

  then("Privacy Policy and Terms of Service appear directly below References & credits", async ({gunsmith}) => {
    await expect
      .poll(() => gunsmith.menu.getMainLinks())
      .toEqual(["References & credits", "Privacy Policy", "Terms of Service"]);
  });

  when("the player presses Escape", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.menu.pressEscape();
    });

    then("the menu closes and Settings receives focus", async ({gunsmith}) => {
      expect(await gunsmith.menu.isOpen()).toBe(false);
      expect(await gunsmith.menu.isSettingsFocused()).toBe(true);
    });

    when("they click Settings", () => {
      beforeEach(async ({gunsmith}) => {
        await gunsmith.menu.pressSettings();
      });

      then("the menu opens again", async ({gunsmith}) => {
        expect(await gunsmith.menu.isOpen()).toBe(true);
      });
    });
  });

  when("the player enters Options and presses Escape", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.menu.chooseOptions();
      await gunsmith.menu.pressEscape();
    });

    then("the main menu is open", async ({gunsmith}) => {
      expect(await gunsmith.menu.isOpen()).toBe(true);
      expect(await gunsmith.menu.showsOptions()).toBe(false);
    });
  });

  when("the player turns off the startup menu and reloads", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.menu.chooseOptions();
      await gunsmith.menu.setStartupMenu(false);
      await gunsmith.reloadThePage();
    });

    then("the game starts with its menu closed", async ({gunsmith}) => {
      expect(await gunsmith.menu.isOpen()).toBe(false);
    });

    when("they turn it back on and reload", () => {
      beforeEach(async ({gunsmith}) => {
        await gunsmith.menu.pressEscape();
        await gunsmith.menu.chooseOptions();
        await gunsmith.menu.setStartupMenu(true);
        await gunsmith.reloadThePage();
      });

      then("the menu is open again", async ({gunsmith}) => {
        expect(await gunsmith.menu.isOpen()).toBe(true);
      });
    });
  });

  when("the player chooses Workshop", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.menu.chooseWorkshop();
    });

    then("the workshop opens and takes over from the menu", async ({gunsmith}) => {
      expect(await gunsmith.workshop.isOpen()).toBe(true);
      expect(await gunsmith.menu.isOpen()).toBe(false);
    });

    when("they press Escape", () => {
      beforeEach(async ({gunsmith}) => {
        await gunsmith.menu.pressEscape();
      });

      then("the practice range is clear of panels", async ({gunsmith}) => {
        expect(await gunsmith.workshop.isOpen()).toBe(false);
        expect(await gunsmith.menu.isOpen()).toBe(false);
      });
    });
  });
});

given("the practice range opened with the startup override", () => {
  then("the startup menu is closed", async ({gunsmith}) => {
    expect(await gunsmith.menu.isOpen()).toBe(false);
  });

  when("the player opens Options", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.menu.pressSettings();
      await gunsmith.menu.chooseOptions();
    });

    then("the saved preference is still enabled", async ({gunsmith}) => {
      expect(await gunsmith.menu.showsStartupMenuChecked()).toBe(true);
    });
  });

  when("the player visits without the override", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.menu.loadWithoutOverride();
    });

    then("the startup menu is open", async ({gunsmith}) => {
      expect(await gunsmith.menu.isOpen()).toBe(true);
    });
  });
});

given("the player previously turned off the startup menu", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.menu.useLegacyStartupPreference();
    await gunsmith.menu.loadWithoutOverride();
  });

  then("their preference survives the storage format change", async ({gunsmith}) => {
    expect(await gunsmith.menu.isOpen()).toBe(false);
  });
});
