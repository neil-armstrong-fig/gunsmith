import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

// The player starts at (8.5, 3.5) on the low ground, level 0. A platform one level up fills the east end of the arena from
// x = 10, and one stair, on the player's row at x = 9, climbs onto it. Everywhere else the platform's edge is a drop that
// the player cannot walk up. The player's body is 0.4 of a tile wide on each side, so the edge stops them at x = 9.6.
const PLATFORM_EDGE = 10;
const ALONGSIDE_THE_STAIR = 4.6;
const LOW_GROUND = 0;
const PLATFORM = 1;

given("a player on low ground beside a raised platform with one stair up", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.startHeights();
  });

  then("the player begins on the low ground", async ({gunsmith}) => {
    expect(await gunsmith.player.getLevel()).toBe(LOW_GROUND);
  });

  when("the player walks east along the row of the stair", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.player.startWalking("east");
    });

    then("the player climbs onto the platform", async ({gunsmith}) => {
      await expect.poll(async () => (await gunsmith.player.getPosition()).x).toBeGreaterThan(PLATFORM_EDGE + 1);

      expect(await gunsmith.player.getLevel()).toBe(PLATFORM);
    });
  });

  when("the player walks up beside the stair and then east into the platform's edge", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.player.startWalking("north");
      await expect.poll(async () => (await gunsmith.player.getPosition()).y).toBeGreaterThan(ALONGSIDE_THE_STAIR);
      await gunsmith.player.stopWalking("north");

      await gunsmith.player.startWalking("east");
      await gunsmith.waitForGameSeconds(1);
    });

    then("the edge stops the player on the low ground, as a wall would", async ({gunsmith}) => {
      const {x} = await gunsmith.player.getPosition();

      expect(x).toBeLessThan(PLATFORM_EDGE - 0.3);
      expect(x).toBeGreaterThan(PLATFORM_EDGE - 0.6);
      expect(await gunsmith.player.getLevel()).toBe(LOW_GROUND);
    });
  });

  when("the player climbs the stair and then walks back west", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.player.startWalking("east");
      await expect.poll(async () => (await gunsmith.player.getPosition()).x).toBeGreaterThan(PLATFORM_EDGE + 1);
      await gunsmith.player.stopWalking("east");

      await gunsmith.player.startWalking("west");
    });

    then("the player comes down onto the low ground again", async ({gunsmith}) => {
      await expect.poll(async () => (await gunsmith.player.getPosition()).x).toBeLessThan(PLATFORM_EDGE - 1);

      expect(await gunsmith.player.getLevel()).toBe(LOW_GROUND);
    });
  });
});
