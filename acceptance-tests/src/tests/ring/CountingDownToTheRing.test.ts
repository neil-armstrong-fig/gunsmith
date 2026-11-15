import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

// The ring starts to close this many seconds into a round (the engine's `RING_START_DELAY_SECONDS`).
const RING_START_SECONDS = 45;

// A round has only just begun when the page is read, but a loaded machine may take some seconds to get there.
const LONGEST_WAIT_TO_LOOK_SECONDS = 15;

// Against a player who stands still the opponent has won a round within 9.4 game seconds on every one of 40 seeds
// measured in the engine, so fifteen is the longest this spec waits for a round to be lost.
const LONGEST_LOSS_SECONDS = 15;

given("a duel has just begun", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.startDuel();
  });

  when("the player has done nothing yet", () => {
    then("the ring is about to start in nearly the whole start delay", async ({gunsmith}) => {
      const {secondsUntilStart} = await gunsmith.ring.get();

      expect(secondsUntilStart).toBeLessThanOrEqual(RING_START_SECONDS);
      expect(secondsUntilStart).toBeGreaterThan(RING_START_SECONDS - LONGEST_WAIT_TO_LOOK_SECONDS);
    });

    then("the screen counts down to it in minutes and seconds", async ({gunsmith}) => {
      expect(await gunsmith.ring.getCountdownOnScreen()).toMatch(/^Ring in 0:[34]\d$/);
    });
  });

  when("a second of the round is played", () => {
    let secondsBefore = 0;

    beforeEach(async ({gunsmith}) => {
      secondsBefore = (await gunsmith.ring.get()).secondsUntilStart;
      await gunsmith.waitForGameSeconds(1);
    });

    then("the countdown has fallen by at least that second", async ({gunsmith}) => {
      const {secondsUntilStart} = await gunsmith.ring.get();

      expect(secondsUntilStart).toBeLessThanOrEqual(secondsBefore - 1 + 0.001);
    });
  });

  when("the player stands still and loses the round", () => {
    let secondsAtLoss = 0;
    let countdownAtLoss = "";

    beforeEach(async ({gunsmith}) => {
      await gunsmith.round.waitForState("lost", LONGEST_LOSS_SECONDS);
      secondsAtLoss = (await gunsmith.ring.get()).secondsUntilStart;
      countdownAtLoss = await gunsmith.ring.getCountdownOnScreen();
      await gunsmith.waitForGameSeconds(1);
    });

    then("the countdown has stopped, though the game's clock runs on", async ({gunsmith}) => {
      expect((await gunsmith.ring.get()).secondsUntilStart).toBe(secondsAtLoss);
    });

    then("the screen's countdown has stopped with it", async ({gunsmith}) => {
      expect(await gunsmith.ring.getCountdownOnScreen()).toBe(countdownAtLoss);
    });
  });

  when("the player loses the first round and goes on to the next", () => {
    let secondsAtLoss = 0;

    beforeEach(async ({gunsmith}) => {
      await gunsmith.round.waitForState("lost", LONGEST_LOSS_SECONDS);
      secondsAtLoss = (await gunsmith.ring.get()).secondsUntilStart;
      await gunsmith.round.nextRound();
      await gunsmith.round.waitForBannerToGo();
    });

    then("the countdown begins again, with more time left than the lost round had", async ({gunsmith}) => {
      const {secondsUntilStart} = await gunsmith.ring.get();

      expect(secondsUntilStart).toBeGreaterThan(secondsAtLoss);
      expect(secondsUntilStart).toBeLessThanOrEqual(RING_START_SECONDS);
    });
  });
});

given("a sparring match has just begun", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.startSparring();
  });

  when("the player has done nothing yet", () => {
    then("the game has no ring", async ({gunsmith}) => {
      expect(await gunsmith.ring.exists()).toBe(false);
    });

    then("the screen shows no countdown", async ({gunsmith}) => {
      expect(await gunsmith.ring.isCountdownOnScreen()).toBe(false);
    });
  });
});

given("the practice range is open", () => {
  when("the player has done nothing yet", () => {
    then("the game has no ring", async ({gunsmith}) => {
      expect(await gunsmith.ring.exists()).toBe(false);
    });

    then("the screen shows no countdown", async ({gunsmith}) => {
      expect(await gunsmith.ring.isCountdownOnScreen()).toBe(false);
    });
  });
});
