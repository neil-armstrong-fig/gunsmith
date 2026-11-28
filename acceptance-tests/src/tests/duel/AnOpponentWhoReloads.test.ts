import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

// In the long duel the opponent first reloads at 5.5 game seconds, has a full magazine at 7.0 and wins at 9.4 (measured in
// the engine), so twelve seconds is the longest this spec waits for any one of them.
const LONGEST_WAIT_SECONDS = 12;

given("a long duel has just begun", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.scenario.startLongDuel();
  });

  when("the player stands still until the opponent has shot its whole magazine", () => {
    then("the opponent reloads, and has a full magazine again afterwards", async ({gunsmith}) => {
      const full = (await gunsmith.opponent.get()).rounds;

      await gunsmith.opponent.waitForBehaviour("reload", LONGEST_WAIT_SECONDS);

      expect((await gunsmith.opponent.get()).rounds).toBeLessThan(full);

      await gunsmith.opponent.waitForRoundsAtLeast(full, LONGEST_WAIT_SECONDS);

      // The wait is what shows the magazine was full. By the time it is read again the opponent may have fired a shot, so
      // only that it is no longer empty is asserted: it was empty when the reload began.
      expect((await gunsmith.opponent.get()).rounds).toBeGreaterThan(0);
    });

    then("the opponent goes back to the fight once it has reloaded", async ({gunsmith}) => {
      await gunsmith.opponent.waitForBehaviour("reload", LONGEST_WAIT_SECONDS);
      await gunsmith.opponent.waitForBehaviourOtherThan("reload", LONGEST_WAIT_SECONDS);

      expect((await gunsmith.opponent.get()).behaviour).not.toBe("reload");
    });
  });
});
