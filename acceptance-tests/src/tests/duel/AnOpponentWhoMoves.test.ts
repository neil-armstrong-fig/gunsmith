import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

given("a duel has just begun", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.startDuel();
  });

  when("the player stands still in front of the opponent", () => {
    then("the opponent has seen the player and joined the fight", async ({gunsmith}) => {
      await gunsmith.opponent.waitForBehaviour("engage");

      // It starts out wandering. By now it may already have moved on to searching or reloading, so it is not engaging
      // that is asserted, only that it is no longer wandering.
      expect((await gunsmith.opponent.get()).behaviour).not.toBe("wander");
    });

    then("the opponent leaves the spot it began on", async ({gunsmith}) => {
      const start = await gunsmith.opponent.get();

      await gunsmith.opponent.waitToBeAwayFrom(start, 0.5);

      // It may be coming back by the time it is looked at again, so only part of the distance it was waited for is asserted.
      const now = await gunsmith.opponent.get();
      expect(Math.hypot(now.x - start.x, now.y - start.y)).toBeGreaterThanOrEqual(0.25);
    });

    then("the opponent's magazine runs down as it shoots", async ({gunsmith}) => {
      const before = (await gunsmith.opponent.get()).rounds;

      await gunsmith.opponent.waitForRoundsBelow(before);

      expect((await gunsmith.opponent.get()).rounds).toBeLessThan(before);
    });
  });
});
