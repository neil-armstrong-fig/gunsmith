import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

// The player starts at (8.5, 3.5) on the low ground, facing east. A platform one level up fills the east end from x = 10, and
// one stair, on the player's row at x = 9, climbs onto it. A dummy stands on the platform four tiles east of the player and
// another on the low ground four tiles west, both on the player's row and well inside the rifle's reach, so what hides one is
// the height and nothing else.
const PLATFORM_DUMMY = {x: 12.5, y: 3.5};
const LOW_GROUND_DUMMY = {x: 4.5, y: 3.5};
const PLATFORM_EDGE = 10;
const PLATFORM = 1;

given("a player on the low ground, a dummy on the platform ahead and another on the low ground behind them", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.startHeights();
  });

  when("the player faces the dummy on the platform", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.player.aimAtTile(PLATFORM_DUMMY);
      await gunsmith.waitForGameSeconds(0.3);
    });

    then(
      "the player does not see it, though it is in front of them and within reach, because they cannot see up onto the platform",
      async ({gunsmith}) => {
        const player = await gunsmith.player.getPosition();
        const view = await gunsmith.vision.getView();

        expect(Math.hypot(PLATFORM_DUMMY.x - player.x, PLATFORM_DUMMY.y - player.y)).toBeLessThan(view.range);
        expect(await gunsmith.dummies.isSeenAt(PLATFORM_DUMMY)).toBe(false);
      },
    );
  });

  when("the player faces the dummy on the low ground", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.player.aimAtTile(LOW_GROUND_DUMMY);
    });

    then("the player sees it, as on any flat ground", async ({gunsmith}) => {
      await expect.poll(() => gunsmith.dummies.isSeenAt(LOW_GROUND_DUMMY)).toBe(true);
    });
  });

  when("the player climbs the stair onto the platform", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.player.startWalking("east");
      await expect.poll(async () => (await gunsmith.player.getPosition()).x).toBeGreaterThan(PLATFORM_EDGE + 1);
      await gunsmith.player.stopWalking("east");
    });

    then("the player is on the platform", async ({gunsmith}) => {
      expect(await gunsmith.player.getLevel()).toBe(PLATFORM);
    });

    when("the player faces the dummy there", () => {
      beforeEach(async ({gunsmith}) => {
        await gunsmith.player.aimAtTile(PLATFORM_DUMMY);
      });

      then("the player sees it, now that they stand as high as it", async ({gunsmith}) => {
        await expect.poll(() => gunsmith.dummies.isSeenAt(PLATFORM_DUMMY)).toBe(true);
      });
    });

    when("the player faces back down at the dummy on the low ground", () => {
      beforeEach(async ({gunsmith}) => {
        await gunsmith.player.aimAtTile(LOW_GROUND_DUMMY);
      });

      then("the player sees it, because higher ground sees down", async ({gunsmith}) => {
        await expect.poll(() => gunsmith.dummies.isSeenAt(LOW_GROUND_DUMMY)).toBe(true);
      });
    });
  });
});
