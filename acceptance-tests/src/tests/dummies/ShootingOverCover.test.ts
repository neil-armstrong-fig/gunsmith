import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

// The same arrangement as `HidingBehindCover`: the player starts at (3.5, 3.5) on the low ground, facing east, and two low cover
// blocks stand at (7.5, 3.5) and (7.5, 1.5). Three dummies stand east of them: one standing at (8.5, 3.5) with a block between it and
// the player, one crouched at (8.5, 1.5) with a block right beside it on the way, and one crouched at (8.5, 5.5) in the open. A
// standing player's shot flies over a block, but a fighter who crouches beside one is below that shot; a crouched player's shot is
// stopped by the block. The game is held, so a shot is looked for at every frame and the dummies are judged once it has surely ended.
const STANDING_BEHIND_COVER = {x: 8.5, y: 3.5};
const CROUCHED_BEHIND_COVER = {x: 8.5, y: 1.5};
const CROUCHED_IN_THE_OPEN = {x: 8.5, y: 5.5};
const SHOT_WATCH = {maxSeconds: 5, stepSeconds: 0.05};
// One frame at a time for six frames (120 ms), then long enough for the shot surely to have ended, a dummy's row being eight tiles of rifle flight at most.
const EVERY_FRAME_WATCH = {maxSeconds: 0.12, stepSeconds: 0.02};
const LONGER_THAN_THE_SHOT_LIVES_SECONDS = 1;
// Long enough for the crouch to take hold: the player's view reaches farther once they are crouching.
const CROUCH_TAKES_HOLD_SECONDS = 0.5;

given("a player facing three dummies, two of them behind a low cover block", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.scenario.startCover();
    await gunsmith.clock.holdTheGame();
  });

  when("the player, standing, shoots the dummy standing behind cover", () => {
    let health: number | undefined;

    beforeEach(async ({gunsmith}) => {
      health = await gunsmith.dummies.getHealthAt(STANDING_BEHIND_COVER);

      await gunsmith.player.aimAtTile(STANDING_BEHIND_COVER);
      await gunsmith.player.fire();
      await gunsmith.dummies.runUntilHurt(STANDING_BEHIND_COVER, SHOT_WATCH);
    });

    then("the dummy is hurt, because a standing player's shot flies over a low block", async ({gunsmith}) => {
      expect(health).toBeDefined();
      expect(await gunsmith.dummies.getHealthAt(STANDING_BEHIND_COVER)).toBeLessThan(health ?? 0);
    });
  });

  when("the player, standing, shoots the crouched dummy behind cover", () => {
    let health: number | undefined;
    let shotLeft = false;

    beforeEach(async ({gunsmith}) => {
      health = await gunsmith.dummies.getHealthAt(CROUCHED_BEHIND_COVER);

      await gunsmith.player.aimAtTile(CROUCHED_BEHIND_COVER);
      shotLeft = (await gunsmith.player.fireAndWatchTheShot(EVERY_FRAME_WATCH)).seenInTheAir;
      await gunsmith.clock.runGameFor(LONGER_THAN_THE_SHOT_LIVES_SECONDS);
    });

    then(
      "the shot flew but the dummy is not hurt, because a shot that crossed the block passes over a fighter crouched beside it",
      async ({gunsmith}) => {
        expect(shotLeft).toBe(true);
        expect(health).toBeDefined();
        expect(await gunsmith.dummies.getHealthAt(CROUCHED_BEHIND_COVER)).toBe(health);
      },
    );
  });

  when("the player, standing, shoots the crouched dummy in the open", () => {
    let health: number | undefined;

    beforeEach(async ({gunsmith}) => {
      health = await gunsmith.dummies.getHealthAt(CROUCHED_IN_THE_OPEN);

      await gunsmith.player.aimAtTile(CROUCHED_IN_THE_OPEN);
      await gunsmith.player.fire();
      await gunsmith.dummies.runUntilHurt(CROUCHED_IN_THE_OPEN, SHOT_WATCH);
    });

    then("the dummy is hurt, because crouching alone shields nothing", async ({gunsmith}) => {
      expect(health).toBeDefined();
      expect(await gunsmith.dummies.getHealthAt(CROUCHED_IN_THE_OPEN)).toBeLessThan(health ?? 0);
    });
  });

  when("the player crouches", () => {
    beforeEach(async ({gunsmith}) => {
      const standingView = await gunsmith.vision.getView();

      await gunsmith.player.crouch();
      await gunsmith.clock.runGameFor(CROUCH_TAKES_HOLD_SECONDS);

      expect((await gunsmith.vision.getView()).range).toBeGreaterThan(standingView.range);
    });

    when("the player shoots the dummy standing behind cover", () => {
      let health: number | undefined;
      let shotLeft = false;

      beforeEach(async ({gunsmith}) => {
        health = await gunsmith.dummies.getHealthAt(STANDING_BEHIND_COVER);

        await gunsmith.player.aimAtTile(STANDING_BEHIND_COVER);
        shotLeft = (await gunsmith.player.fireAndWatchTheShot(EVERY_FRAME_WATCH)).seenInTheAir;
        await gunsmith.clock.runGameFor(LONGER_THAN_THE_SHOT_LIVES_SECONDS);
      });

      then("the shot is stopped by the block and the dummy is not hurt", async ({gunsmith}) => {
        expect(shotLeft).toBe(true);
        expect(await gunsmith.bullets.count()).toBe(0);
        expect(health).toBeDefined();
        expect(await gunsmith.dummies.getHealthAt(STANDING_BEHIND_COVER)).toBe(health);
      });
    });

    when("the player shoots the crouched dummy in the open", () => {
      let health: number | undefined;

      beforeEach(async ({gunsmith}) => {
        health = await gunsmith.dummies.getHealthAt(CROUCHED_IN_THE_OPEN);

        await gunsmith.player.aimAtTile(CROUCHED_IN_THE_OPEN);
        await gunsmith.player.fire();
        await gunsmith.dummies.runUntilHurt(CROUCHED_IN_THE_OPEN, SHOT_WATCH);
      });

      then("the dummy is hurt, because no block is in the way", async ({gunsmith}) => {
        expect(health).toBeDefined();
        expect(await gunsmith.dummies.getHealthAt(CROUCHED_IN_THE_OPEN)).toBeLessThan(health ?? 0);
      });
    });
  });
});
