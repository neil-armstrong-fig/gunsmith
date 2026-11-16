import type {PickupSnapshot} from "@gunsmith/shared/state-hook/types/PickupSnapshot";
import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

// Against a player who stands still the opponent has won a round within 9.4 game seconds on every one of 40 seeds measured
// in the engine, so fifteen is the longest this spec waits for a round to be lost.
const LONGEST_LOSS_SECONDS = 15;

given("a duel has just begun", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.startDuel();
  });

  when("the first round has just begun", () => {
    then("a weapon lies in the arena", async ({gunsmith}) => {
      expect(await gunsmith.pickup.get()).toBeDefined();
    });
  });

  when("the player stands still, loses the first round and goes on to the next", () => {
    let firstRound: PickupSnapshot | undefined;

    beforeEach(async ({gunsmith}) => {
      firstRound = await gunsmith.pickup.get();

      await gunsmith.round.waitForState("lost", LONGEST_LOSS_SECONDS);
      await gunsmith.round.nextRound();
      await gunsmith.round.waitForBannerToGo();
    });

    then("a weapon lies in the arena again, in a new place", async ({gunsmith}) => {
      const second = await gunsmith.pickup.get();

      expect(second).toBeDefined();
      expect(firstRound).toBeDefined();
      expect([second?.x, second?.y]).not.toEqual([firstRound?.x, firstRound?.y]);
    });
  });
});

given("the practice range", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.begin();
  });

  when("the game has just begun", () => {
    then("no weapon lies in the arena, since there is no opponent to be as far from", async ({gunsmith}) => {
      expect(await gunsmith.pickup.get()).toBeUndefined();
    });
  });
});

given("the heights arena", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.startHeights();
  });

  when("the game has just begun", () => {
    then("no weapon lies in the arena, since there is no opponent to be as far from", async ({gunsmith}) => {
      expect(await gunsmith.pickup.get()).toBeUndefined();
    });
  });
});
