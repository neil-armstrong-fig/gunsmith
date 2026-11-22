import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

// East of the start (12.5, 7.5) the middle row of the practice range is clear to the wall, so half a second of walking is a clear distance.
const HALF_A_SECOND = 0.5;
const CLEARLY_WALKED_TILES = 0.5;

given("the practice range, held still", () => {
  let startX = 0;
  let endX = 0;

  beforeEach(async ({gunsmith}) => {
    await gunsmith.holdTheGame();
    startX = (await gunsmith.player.getPosition()).x;
  });

  when("the player holds the walk key with the workshop shut", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.player.startWalking("east");
      await gunsmith.runGameFor(HALF_A_SECOND);
      await gunsmith.player.stopWalking("east");
      endX = (await gunsmith.player.getPosition()).x;
    });

    then("the player walks on", () => {
      expect(endX).toBeGreaterThan(startX + CLEARLY_WALKED_TILES);
    });
  });

  when("the player is already walking when the workshop opens", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.player.startWalking("east");
      await gunsmith.workshop.open();
      await gunsmith.runGameFor(HALF_A_SECOND);
      endX = (await gunsmith.player.getPosition()).x;
      await gunsmith.player.stopWalking("east");
    });

    then("the player stands where they were, because the game waits while the workshop is open", () => {
      expect(endX).toBe(startX);
    });
  });

  when("the player opens the workshop", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.workshop.open();
    });

    then("the workshop is open", async ({gunsmith}) => {
      expect(await gunsmith.workshop.isOpen()).toBe(true);
    });

    then("the arena is no longer drawn, so a slow machine's keys reach the panel", async ({gunsmith}) => {
      expect(await gunsmith.arena.isDrawing()).toBe(false);
    });
  });

  when("the player opens the workshop, closes it with Escape and holds the walk key", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.workshop.open();
      await gunsmith.workshop.close();
      await gunsmith.player.startWalking("east");
      await gunsmith.runGameFor(HALF_A_SECOND);
      await gunsmith.player.stopWalking("east");
      endX = (await gunsmith.player.getPosition()).x;
    });

    then("the workshop is shut", async ({gunsmith}) => {
      expect(await gunsmith.workshop.isOpen()).toBe(false);
    });

    then("the game goes on and the player walks", () => {
      expect(endX).toBeGreaterThan(startX + CLEARLY_WALKED_TILES);
    });

    then("the arena is drawn again", async ({gunsmith}) => {
      expect(await gunsmith.arena.isDrawing()).toBe(true);
    });
  });
});

given("a duel has begun", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.startDuel();
  });

  when("the player presses the workshop key", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.workshop.open();
      await gunsmith.waitForGameSeconds(0.3);
    });

    then("no workshop opens, because nothing is made in a match", async ({gunsmith}) => {
      expect(await gunsmith.workshop.isOpen()).toBe(false);
    });
  });
});
