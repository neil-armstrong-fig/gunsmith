import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

// The cover hall: ten tiles long and one wide, with a low cover block at the third tile and the eighth. The player stands in the two
// tiles west of the first block, right beside it, and the opponent in the two tiles east of the second, seven tiles apart on one row, so
// every shot along the row crosses both blocks. The opponent stands and fires; it sees a standing player over the block, but not one
// who crouches beside it, since cover right beside a crouched fighter hides them.
const SEEDS = [1, 4];
const HURT_WATCH = {maxSeconds: 10, stepSeconds: 0.05};
const A_FRAME_SECONDS = 0.02;
// Longer than a shot takes to cross the hall and than the opponent takes to fire a burst, so any shot meant for the player has landed or passed.
const LONGER_THAN_A_BURST_SECONDS = 3;

given.each(
  SEEDS,
  seed => `a cover hall (seed ${seed}), the player standing in their pocket and the opponent in theirs`,
  seed => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.scenario.startCoverHall(seed);
    });

    when("the player stands still", () => {
      then("the opponent's shots fly over both blocks and hurt them", async ({gunsmith}) => {
        await gunsmith.player.waitForHealthBelow(100);

        expect(await gunsmith.player.getHealth()).toBeLessThan(100);
      });
    });

    when("the player crouches beside their block once the opponent has hit them", () => {
      let healthWhenCrouched = 0;
      let shotsInTheAir = 0;

      beforeEach(async ({gunsmith}) => {
        await gunsmith.clock.holdTheGame();
        await gunsmith.player.runUntilHurt(HURT_WATCH);
        healthWhenCrouched = await gunsmith.player.getHealth();
        shotsInTheAir = await gunsmith.bullets.count();

        await gunsmith.player.crouch();
        await gunsmith.clock.runGameFor(A_FRAME_SECONDS);
        await gunsmith.clock.runGameFor(LONGER_THAN_A_BURST_SECONDS);
      });

      then(
        "no shot hurts them any more, though some were still in the air, because they pass over a fighter crouched beside cover",
        async ({gunsmith}) => {
          expect(shotsInTheAir).toBeGreaterThan(0);
          expect(await gunsmith.player.getHealth()).toBe(healthWhenCrouched);
        },
      );
    });
  },
);
