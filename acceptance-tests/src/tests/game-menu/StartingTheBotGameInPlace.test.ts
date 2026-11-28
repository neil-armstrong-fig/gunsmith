import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

given("a player opening the practice range menu", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.menu.rememberTheArenaCanvas();
    await gunsmith.menu.pressSettings();
  });

  when("they start a bot game", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.preRound.startBotGame();
    });

    then("loadout selection opens on the original canvas", async ({gunsmith}) => {
      expect(await gunsmith.preRound.isOpen()).toBe(true);
      expect(await gunsmith.menu.usesTheSameArenaCanvas()).toBe(true);
      expect(await gunsmith.round.getElapsedSeconds()).toBe(0);
    });

    when("they confirm their loadout and start the match", () => {
      beforeEach(async ({gunsmith}) => {
        await gunsmith.preRound.lockIn();
        await gunsmith.preRound.startTheMatch();
        await gunsmith.clock.waitForGameSeconds(0.2);
      });

      then("the bot round is running on the original canvas", async ({gunsmith}) => {
        expect(await gunsmith.menu.usesTheSameArenaCanvas()).toBe(true);
        expect(await gunsmith.round.getElapsedSeconds()).toBeGreaterThan(0);
      });
    });

    when("they press Back in loadout selection", () => {
      beforeEach(async ({gunsmith}) => {
        await gunsmith.preRound.pressBack();
      });

      then("the practice menu returns on the original canvas", async ({gunsmith}) => {
        await expect.poll(() => gunsmith.preRound.hasStartBotGame()).toBe(true);
        expect(await gunsmith.menu.usesTheSameArenaCanvas()).toBe(true);
      });
    });

    when("they go back in their browser", () => {
      beforeEach(async ({gunsmith}) => {
        await gunsmith.menu.goBackInBrowser();
        await expect.poll(() => gunsmith.preRound.hasStartBotGame()).toBe(true);
      });

      then("the practice menu returns on the original canvas", async ({gunsmith}) => {
        expect(await gunsmith.menu.usesTheSameArenaCanvas()).toBe(true);
        expect(await gunsmith.preRound.isOpen()).toBe(false);
      });

      when("they go forward again", () => {
        beforeEach(async ({gunsmith}) => {
          await gunsmith.menu.goForwardInBrowser();
          await expect.poll(() => gunsmith.preRound.isOpen()).toBe(true);
        });

        then("loadout selection opens on the original canvas again", async ({gunsmith}) => {
          expect(await gunsmith.menu.usesTheSameArenaCanvas()).toBe(true);
          expect(await gunsmith.round.getElapsedSeconds()).toBe(0);
        });
      });
    });
  });
});

given("a player who opened the practice range with a seed in its address, and played a bot game from its menu", () => {
  let firstStart: object = {};

  beforeEach(async ({gunsmith}) => {
    await gunsmith.scenario.openTheSeededPracticeRange();

    await gunsmith.menu.pressSettings();
    await gunsmith.preRound.startBotGame();
    await gunsmith.preRound.lockIn();
    await gunsmith.preRound.startTheMatch();

    firstStart = await gunsmith.player.getPosition();
  });

  when("they open the same address again and start another bot game", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.scenario.openTheSeededPracticeRange();

      await gunsmith.menu.pressSettings();
      await gunsmith.preRound.startBotGame();
      await gunsmith.preRound.lockIn();
      await gunsmith.preRound.startTheMatch();
    });

    then("the bot game plays the same duel, starting the player where it did before", async ({gunsmith}) => {
      expect(await gunsmith.player.getPosition()).toEqual(firstStart);
    });
  });
});
