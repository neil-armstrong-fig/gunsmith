import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

given("a sparring match has just begun", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.startSparring();
  });

  when("the player has done nothing yet", () => {
    then("the round is being fought", async ({gunsmith}) => {
      expect(await gunsmith.round.getState()).toBe("playing");
      expect(await gunsmith.round.isBannerShown()).toBe(false);
    });

    then("the opponent stands where it began, taking no action", async ({gunsmith}) => {
      const start = await gunsmith.opponent.get();

      await gunsmith.waitForGameSeconds(3);

      const now = await gunsmith.opponent.get();
      expect(now.x).toBeCloseTo(start.x, 9);
      expect(now.y).toBeCloseTo(start.y, 9);
      expect(now.behaviour).toBeUndefined();
    });

    then("the opponent stands in the arena with health to lose", async ({gunsmith}) => {
      const opponent = await gunsmith.opponent.get();
      const arena = await gunsmith.arena.getSizeInTiles();

      expect(opponent.health).toBeGreaterThan(0);
      expect(opponent.x).toBeGreaterThan(0);
      expect(opponent.x).toBeLessThan(arena.width);
      expect(opponent.y).toBeGreaterThan(0);
      expect(opponent.y).toBeLessThan(arena.height);
    });
  });

  when("the player shoots the opponent once", () => {
    let healthBefore = 0;

    beforeEach(async ({gunsmith}) => {
      const opponent = await gunsmith.opponent.get();
      healthBefore = opponent.health;

      await gunsmith.player.aimAtTile(opponent);
      await gunsmith.player.fire();
    });

    then("the opponent has less health but the round goes on", async ({gunsmith}) => {
      await gunsmith.opponent.waitForHealthBelow(healthBefore);

      expect((await gunsmith.opponent.get()).health).toBeLessThan(healthBefore);
      expect(await gunsmith.round.getState()).toBe("playing");
    });
  });

  when("the player keeps firing at the opponent", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.player.aimAtTile(await gunsmith.opponent.get());
      await gunsmith.player.startFiring();
    });

    then("the opponent has no health left and the round is won", async ({gunsmith}) => {
      await gunsmith.round.waitForState("won");

      expect((await gunsmith.opponent.get()).health).toBe(0);
    });

    then("the screen says the round was won", async ({gunsmith}) => {
      expect(await gunsmith.round.getBannerMessage()).toBe("You won");
    });
  });

  when("the round is won and the player plays again", () => {
    let fullHealth = 0;

    beforeEach(async ({gunsmith}) => {
      fullHealth = (await gunsmith.opponent.get()).health;

      await gunsmith.player.aimAtTile(await gunsmith.opponent.get());
      await gunsmith.player.startFiring();
      await gunsmith.round.waitForState("won");
      await gunsmith.player.stopFiring();
      await gunsmith.round.playAgain();
    });

    then("a fresh round begins with the banner gone", async ({gunsmith}) => {
      await gunsmith.round.waitForBannerToGo();

      expect(await gunsmith.round.getState()).toBe("playing");
    });

    then("the opponent is back at full health", async ({gunsmith}) => {
      await gunsmith.round.waitForBannerToGo();

      expect((await gunsmith.opponent.get()).health).toBe(fullHealth);
    });
  });
});
