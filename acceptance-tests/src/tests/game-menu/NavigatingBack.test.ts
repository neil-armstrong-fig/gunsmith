import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

given("the Game menu on the practice range", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.menu.pressSettings();
  });

  when("the player goes back from Options", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.menu.chooseOptions();
      await gunsmith.menu.pressBack();
    });

    then("the main menu offers a bot game again", async ({gunsmith}) => {
      expect(await gunsmith.preRound.hasStartBotGame()).toBe(true);
    });
  });

  when("the player goes back from Workshop", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.menu.chooseWorkshop();
      await gunsmith.workshop.pressBack();
    });

    then("the main menu is open and Workshop is closed", async ({gunsmith}) => {
      expect(await gunsmith.preRound.hasStartBotGame()).toBe(true);
      expect(await gunsmith.workshop.isOpen()).toBe(false);
    });
  });

  when("the player turns off the startup menu, starts a bot game and goes back from loadout selection", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.menu.chooseOptions();
      await gunsmith.menu.setStartupMenu(false);
      await gunsmith.menu.pressBack();
      await gunsmith.preRound.startBotGame();
      await gunsmith.preRound.pressBack();
    });

    then("the main menu opens despite the saved startup preference", async ({gunsmith}) => {
      await expect.poll(() => gunsmith.preRound.hasStartBotGame()).toBe(true);
      expect(await gunsmith.preRound.isOpen()).toBe(false);
    });

    when("the player reloads from the main menu", () => {
      beforeEach(async ({gunsmith}) => {
        await expect.poll(() => gunsmith.preRound.hasStartBotGame()).toBe(true);
        await gunsmith.reloadThePage();
      });

      then("the saved startup preference still keeps the menu closed", async ({gunsmith}) => {
        expect(await gunsmith.menu.isOpen()).toBe(false);
      });
    });
  });

  when("the player chooses a loadout and goes back from the bot reveal", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.preRound.startBotGame();
      await gunsmith.preRound.choose(1, "Submachine gun");
      await gunsmith.preRound.lockIn();
      await gunsmith.preRound.pressBack();
    });

    then("loadout selection returns with the chosen weapon and the round still waiting", async ({gunsmith}) => {
      expect(await gunsmith.preRound.getChosen(1)).toBe("Submachine gun");
      expect(await gunsmith.preRound.isRevealShown()).toBe(false);
      expect(await gunsmith.round.getElapsedSeconds()).toBe(0);
    });
  });

  when("the player leaves an active bot match from Settings", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.preRound.startBotGame();
      await gunsmith.preRound.lockIn();
      await gunsmith.preRound.startTheMatch();
      await gunsmith.menu.pressSettings();
      await gunsmith.menu.backToMainMenu();
    });

    then("the practice range main menu is open", async ({gunsmith}) => {
      await expect.poll(() => gunsmith.preRound.hasStartBotGame()).toBe(true);
    });
  });
});

given("a finished round", () => {
  when("the player goes back from the round banner", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.startMutualKnockout();
      await gunsmith.round.waitForState("drawn");
      await gunsmith.round.backToMainMenu();
    });

    then("the practice range main menu is open", async ({gunsmith}) => {
      await expect.poll(() => gunsmith.preRound.hasStartBotGame()).toBe(true);
    });
  });
});

given("the online entry submenu", () => {
  when("the player presses Back", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.room.entry.openThePracticeRange();
      await gunsmith.menu.pressBack();
    });

    then("the main menu offers a bot game again", async ({gunsmith}) => {
      expect(await gunsmith.preRound.hasStartBotGame()).toBe(true);
    });
  });
});

given("a private room", () => {
  when("the player leaves the room from Settings", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.room.createPrivateRoom();
      await gunsmith.menu.pressSettings();
      await gunsmith.menu.backToMainMenu();
    });

    then("the player is back at the practice menu", async ({gunsmith}) => {
      await expect.poll(() => gunsmith.preRound.hasStartBotGame()).toBe(true);
      expect(gunsmith.room.entry.getFriendCode()).toBeUndefined();
    });
  });
});
