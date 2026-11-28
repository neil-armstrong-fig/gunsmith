import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

given("a sparring match has just begun", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.scenario.startSparring();
  });

  when("nobody has shot the player", () => {
    then("the screen shows the player's health", async ({gunsmith}) => {
      const health = await gunsmith.player.getHealth();

      await gunsmith.hud.waitForHealth(health);

      expect(await gunsmith.hud.getHealth()).toBe(health);
    });
  });
});

given("a duel has just begun", () => {
  let fullHealth = 0;

  beforeEach(async ({gunsmith}) => {
    await gunsmith.scenario.startDuel();
    fullHealth = await gunsmith.player.getHealth();
  });

  when("the opponent has shot the player", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.player.waitForHealthBelow(fullHealth);
    });

    then("the screen shows the health the player has left", async ({gunsmith}) => {
      await gunsmith.hud.waitForHealthToMatchTheGame();

      expect(await gunsmith.hud.getHealth()).toBeLessThan(fullHealth);
    });
  });
});
