import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

given("a local match", () => {
  when("the player opens Settings", () => {
    let pausedAt = 0;

    beforeEach(async ({gunsmith}) => {
      await gunsmith.scenario.startDuel();
      await gunsmith.menu.pressSettings();
      pausedAt = await gunsmith.round.getElapsedSeconds();

      await gunsmith.clock.holdTheGame();
      await gunsmith.clock.runGameFor(0.3);
    });

    then("the round clock stays paused", async ({gunsmith}) => {
      expect(await gunsmith.menu.isOpen()).toBe(true);
      expect(await gunsmith.round.getElapsedSeconds()).toBe(pausedAt);
    });

    when("they resume the game", () => {
      beforeEach(async ({gunsmith}) => {
        await gunsmith.menu.pressEscape();
        await gunsmith.clock.runGameFor(0.3);
      });

      then("the match resumes from the same clock", async ({gunsmith}) => {
        const elapsed = (await gunsmith.round.getElapsedSeconds()) - pausedAt;

        expect(await gunsmith.menu.isOpen()).toBe(false);
        expect(elapsed).toBeGreaterThan(0);
        expect(elapsed).toBeLessThan(0.5);
      });
    });
  });
});

given("two browsers in a private match", () => {
  when("one player opens Settings", () => {
    let elapsedBefore = 0;
    let secondElapsedBefore = 0;
    let positionWithMenu = 0;

    beforeEach(async ({gunsmith}) => {
      const code = await gunsmith.room.createPrivateRoom();
      await gunsmith.room.joinWithASecondBrowser(code);

      const second = gunsmith.room.secondBrowser();

      await gunsmith.room.waitForTheMatch();
      await second.room.waitForTheMatch();

      await gunsmith.player.startWalking("west");
      await gunsmith.clock.waitForGameSeconds(0.15);
      await gunsmith.menu.pressSettings();
      await gunsmith.clock.waitForGameSeconds(0.25);

      positionWithMenu = (await gunsmith.player.getPosition()).x;
      elapsedBefore = await gunsmith.round.getElapsedSeconds();
      secondElapsedBefore = await second.round.getElapsedSeconds();

      await gunsmith.clock.waitForGameSeconds(0.3);
      await second.clock.waitForGameSeconds(0.3);

      await gunsmith.player.stopWalking("west");
    });

    then("the menu warns that play continues, both clocks advance, and the held movement stops", async ({gunsmith}) => {
      expect(await gunsmith.menu.showsOnlineNotice()).toBe(true);
      expect(await gunsmith.round.getElapsedSeconds()).toBeGreaterThan(elapsedBefore);
      expect(await gunsmith.room.secondBrowser().round.getElapsedSeconds()).toBeGreaterThan(secondElapsedBefore);
      expect((await gunsmith.player.getPosition()).x).toBeCloseTo(positionWithMenu, 1);
    });
  });
});
