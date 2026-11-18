import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

// The player starts at (3.5, 3.5) on the low ground, facing east, in an arena with no walls inside it but two low cover blocks,
// at (7.5, 3.5) and (7.5, 1.5), both on rows the player can aim along. Three dummies stand east of them, all well inside the
// rifle's reach: one standing at (8.5, 3.5) with a cover block between it and the player, one crouched at (8.5, 1.5) with a
// cover block right beside it on the way, and one crouched at (8.5, 5.5) in the open with nothing near it. So what hides a
// dummy is the cover and the stance, and nothing else.
const STANDING_BEHIND_COVER = {x: 8.5, y: 3.5};
const CROUCHED_BEHIND_COVER = {x: 8.5, y: 1.5};
const CROUCHED_IN_THE_OPEN = {x: 8.5, y: 5.5};

given("a player facing three dummies, two of them behind a low cover block", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.startCover();
  });

  when("the player, standing, faces the dummy standing behind cover", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.player.aimAtTile(STANDING_BEHIND_COVER);
    });

    then("the player sees it, because a standing player sees over a low block", async ({gunsmith}) => {
      await expect.poll(() => gunsmith.dummies.isSeenAt(STANDING_BEHIND_COVER)).toBe(true);
    });
  });

  when("the player, standing, faces the crouched dummy behind cover", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.player.aimAtTile(CROUCHED_BEHIND_COVER);
      await gunsmith.waitForGameSeconds(0.3);
    });

    then(
      "the player does not see it, though it is in front of them and within reach, because the cover hides it",
      async ({gunsmith}) => {
        const player = await gunsmith.player.getPosition();
        const view = await gunsmith.vision.getView();

        expect(Math.hypot(CROUCHED_BEHIND_COVER.x - player.x, CROUCHED_BEHIND_COVER.y - player.y)).toBeLessThan(
          view.range,
        );
        expect(await gunsmith.dummies.isSeenAt(CROUCHED_BEHIND_COVER)).toBe(false);
      },
    );
  });

  when("the player, standing, faces the crouched dummy in the open", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.player.aimAtTile(CROUCHED_IN_THE_OPEN);
    });

    then("the player sees it, because crouching alone hides nothing", async ({gunsmith}) => {
      await expect.poll(() => gunsmith.dummies.isSeenAt(CROUCHED_IN_THE_OPEN)).toBe(true);
    });
  });

  when("the player crouches and faces the dummy standing behind cover", () => {
    beforeEach(async ({gunsmith}) => {
      const standingView = await gunsmith.vision.getView();

      await gunsmith.player.crouch();
      await expect.poll(async () => (await gunsmith.vision.getView()).range).toBeGreaterThan(standingView.range);
      await gunsmith.player.aimAtTile(STANDING_BEHIND_COVER);
      await gunsmith.waitForGameSeconds(0.3);
    });

    then(
      "the player does not see it, though it is within their longer reach, because they cannot see past the block",
      async ({gunsmith}) => {
        const player = await gunsmith.player.getPosition();
        const view = await gunsmith.vision.getView();

        expect(Math.hypot(STANDING_BEHIND_COVER.x - player.x, STANDING_BEHIND_COVER.y - player.y)).toBeLessThan(
          view.range,
        );
        expect(await gunsmith.dummies.isSeenAt(STANDING_BEHIND_COVER)).toBe(false);
      },
    );

    when("the player faces the crouched dummy in the open", () => {
      beforeEach(async ({gunsmith}) => {
        await gunsmith.player.aimAtTile(CROUCHED_IN_THE_OPEN);
      });

      then("the player sees it, because no block is in the way", async ({gunsmith}) => {
        await expect.poll(() => gunsmith.dummies.isSeenAt(CROUCHED_IN_THE_OPEN)).toBe(true);
      });
    });

    when("the player stands up again", () => {
      beforeEach(async ({gunsmith}) => {
        await gunsmith.player.standUp();
      });

      then("the player sees the dummy again", async ({gunsmith}) => {
        await expect.poll(() => gunsmith.dummies.isSeenAt(STANDING_BEHIND_COVER)).toBe(true);
      });
    });
  });
});
