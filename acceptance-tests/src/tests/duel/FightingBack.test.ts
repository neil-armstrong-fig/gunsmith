import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

// Against a player who stands still the opponent has won within 9.4 game seconds on every one of 40 seeds measured in
// the engine, so fifteen is the longest this spec waits before it calls the opponent too slow.
const LONGEST_WIN_SECONDS = 15;

given("a duel has just begun", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.scenario.startDuel();
  });

  when("the player stands still in front of the opponent", () => {
    then("the opponent's shots take health off the player", async ({gunsmith}) => {
      const fullHealth = await gunsmith.player.getHealth();

      await gunsmith.player.waitForHealthBelow(fullHealth);

      expect(await gunsmith.player.getHealth()).toBeLessThan(fullHealth);
    });

    then("the opponent is not hurt by its own shots", async ({gunsmith}) => {
      const fullHealth = (await gunsmith.opponent.get()).health;

      await gunsmith.player.waitForHealthBelow(await gunsmith.player.getHealth());

      expect((await gunsmith.opponent.get()).health).toBe(fullHealth);
    });

    then("the round is lost in the end, and the screen says so", async ({gunsmith}) => {
      await gunsmith.round.waitForState("lost", LONGEST_WIN_SECONDS);

      expect(await gunsmith.player.getHealth()).toBe(0);
      expect(await gunsmith.round.getBannerMessage()).toBe("You lost");
    });
  });
});
