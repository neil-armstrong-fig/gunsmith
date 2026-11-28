import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

// The same arrangement as `SeeingAcrossLevels`: the player starts at (8.5, 3.5) on the low ground, facing east. A platform one
// level up fills the east end from x = 10, and one stair, on the player's row at x = 9, climbs onto it. A dummy stands on the
// platform four tiles east of the player, two and a half back from its edge, another at the platform's edge off the player's row,
// and a third on the low ground four tiles west, on the player's row. A shot goes where the player can see: from the low ground it
// reaches someone at the platform's edge and stops a little way onto the platform, short of anyone further back; from the
// platform's edge it flies down onto the low ground, and from further back it flies over it.
const PLATFORM_DUMMY = {x: 12.5, y: 3.5};
const EDGE_DUMMY = {x: 10.5, y: 1.5};
const LOW_GROUND_DUMMY = {x: 4.5, y: 3.5};
const PLATFORM_EDGE = 10;
const PLATFORM = 1;
// Far enough onto the platform to stand on it, and still well short of the dummy there, so nothing stands between the player
// and the dummy behind them.
const JUST_ONTO_THE_PLATFORM = PLATFORM_EDGE + 0.6;
// Back from the edge by more than a tile, and still short of the dummy on the platform.
const BACK_FROM_THE_EDGE = PLATFORM_EDGE + 1.6;
// Once on the platform the game is held and run in short steps: the walk is stopped by the game's own time, and each shot is run until it lands. A walk stopped by
// a test that looks every so often ran on while the machine was busy, and the player ended past the dummy on the platform, which then took the shot meant for
// the one behind them (seen at x = 13 with the dummy at 12.5).
const WALK_WATCH = {maxSeconds: 5, stepSeconds: 0.02};
const SHOT_WATCH = {maxSeconds: 5, stepSeconds: 0.05};
// One frame at a time for six frames (120 ms), which is longer than a shot lives against the face a tile and a half ahead; then long enough for it surely to have ended.
const EVERY_FRAME_WATCH = {maxSeconds: 0.12, stepSeconds: 0.02};
const LONGER_THAN_THE_SHOT_LIVES_SECONDS = 1;
// Long enough, in steps of `SHOT_WATCH`, for a shot from the platform to cross the whole low ground to the west wall.
const LONG_SHOT_WATCH = {maxSeconds: 1, stepSeconds: SHOT_WATCH.stepSeconds};

given("a player on the low ground, a dummy on the platform ahead and another on the low ground behind them", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.scenario.startHeights();
  });

  when("the player shoots at the dummy on the platform", () => {
    let health: number | undefined;
    let shotLeft = false;

    beforeEach(async ({gunsmith}) => {
      // Held, because the shot lives for under a tenth of a second (the face is a tile and a half away) and a test that looks every so often missed it on a busy machine.
      await gunsmith.clock.holdTheGame();
      health = await gunsmith.dummies.getHealthAt(PLATFORM_DUMMY);

      await gunsmith.player.aimAtTile(PLATFORM_DUMMY);
      // The click is taken up by the first frame or the second, so the shot is looked for at every frame for longer than it lives (about 75 ms), not at one.
      shotLeft = (await gunsmith.player.fireAndWatchTheShot(EVERY_FRAME_WATCH)).seenInTheAir;
      await gunsmith.clock.runGameFor(LONGER_THAN_THE_SHOT_LIVES_SECONDS);
    });

    then(
      "the shot is stopped a little way onto the platform and the dummy, back from its edge, is not hurt",
      async ({gunsmith}) => {
        expect(shotLeft).toBe(true);
        expect(await gunsmith.bullets.count()).toBe(0);
        expect(await gunsmith.dummies.getHealthAt(PLATFORM_DUMMY)).toBe(health);
      },
    );
  });

  when("the player shoots at the dummy at the platform's edge", () => {
    let health: number | undefined;

    beforeEach(async ({gunsmith}) => {
      await gunsmith.clock.holdTheGame();
      health = await gunsmith.dummies.getHealthAt(EDGE_DUMMY);

      await gunsmith.player.aimAtTile(EDGE_DUMMY);
      await gunsmith.player.fire();
      await gunsmith.dummies.runUntilHurt(EDGE_DUMMY, SHOT_WATCH);
    });

    then("the dummy is hurt, because a shot from below reaches someone at the edge", async ({gunsmith}) => {
      expect(health).toBeDefined();
      expect(await gunsmith.dummies.getHealthAt(EDGE_DUMMY)).toBeLessThan(health ?? 0);
    });
  });

  when("the player shoots at the dummy on the low ground", () => {
    let health: number | undefined;

    beforeEach(async ({gunsmith}) => {
      health = await gunsmith.dummies.getHealthAt(LOW_GROUND_DUMMY);

      await gunsmith.player.aimAtTile(LOW_GROUND_DUMMY);
      await gunsmith.player.fire();
    });

    then("the dummy is hurt, as on any flat ground", async ({gunsmith}) => {
      expect(health).toBeDefined();

      await gunsmith.dummies.waitForHealthBelow(LOW_GROUND_DUMMY, health ?? 0);

      expect(await gunsmith.dummies.getHealthAt(LOW_GROUND_DUMMY)).toBeLessThan(health ?? 0);
    });
  });

  when("the player climbs the stair onto the platform", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.clock.holdTheGame();
      await gunsmith.player.walkUntilPast({heading: "east", limit: JUST_ONTO_THE_PLATFORM, watch: WALK_WATCH});

      expect(await gunsmith.player.getLevel()).toBe(PLATFORM);
    });

    when("the player shoots at the dummy on the platform", () => {
      let health: number | undefined;

      beforeEach(async ({gunsmith}) => {
        health = await gunsmith.dummies.getHealthAt(PLATFORM_DUMMY);

        await gunsmith.player.aimAtTile(PLATFORM_DUMMY);
        await gunsmith.player.fire();
        await gunsmith.dummies.runUntilHurt(PLATFORM_DUMMY, SHOT_WATCH);
      });

      then("the dummy is hurt, now that they stand on the same level", async ({gunsmith}) => {
        expect(health).toBeDefined();
        expect(await gunsmith.dummies.getHealthAt(PLATFORM_DUMMY)).toBeLessThan(health ?? 0);
      });
    });

    when("the player shoots back down at the dummy on the low ground", () => {
      let health: number | undefined;

      beforeEach(async ({gunsmith}) => {
        health = await gunsmith.dummies.getHealthAt(LOW_GROUND_DUMMY);

        await gunsmith.player.aimAtTile(LOW_GROUND_DUMMY);
        await gunsmith.player.fire();
        await gunsmith.dummies.runUntilHurt(LOW_GROUND_DUMMY, SHOT_WATCH);
      });

      then(
        "the dummy is hurt, because a shot from the platform's edge flies down onto the low ground",
        async ({gunsmith}) => {
          expect(health).toBeDefined();
          expect(await gunsmith.dummies.getHealthAt(LOW_GROUND_DUMMY)).toBeLessThan(health ?? 0);
        },
      );
    });

    when("the player steps back from the edge and shoots down at the dummy on the low ground", () => {
      let health: number | undefined;
      let farthestWest: number | undefined;

      beforeEach(async ({gunsmith}) => {
        await gunsmith.player.walkUntilPast({heading: "east", limit: BACK_FROM_THE_EDGE, watch: WALK_WATCH});
        health = await gunsmith.dummies.getHealthAt(LOW_GROUND_DUMMY);

        await gunsmith.player.aimAtTile(LOW_GROUND_DUMMY);
        farthestWest = (await gunsmith.player.fireAndWatchTheShot(LONG_SHOT_WATCH)).farthestWest;
      });

      then("the shot flies on over the dummy, which is not hurt", async ({gunsmith}) => {
        expect(await gunsmith.player.getLevel()).toBe(PLATFORM);
        expect(farthestWest).toBeLessThan(LOW_GROUND_DUMMY.x - 1);
        expect(await gunsmith.dummies.getHealthAt(LOW_GROUND_DUMMY)).toBe(health);
      });
    });
  });
});
