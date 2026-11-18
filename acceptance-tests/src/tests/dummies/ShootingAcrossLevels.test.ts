import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

// The same arrangement as `SeeingAcrossLevels`: the player starts at (8.5, 3.5) on the low ground, facing east. A platform one
// level up fills the east end from x = 10, and one stair, on the player's row at x = 9, climbs onto it. A dummy stands on the
// platform four tiles east of the player and another on the low ground four tiles west, both on the player's row. A shot goes
// where the player can see: what the platform's face hides from the low ground it also stops, and from the platform a shot
// flies out over the low ground.
const PLATFORM_DUMMY = {x: 12.5, y: 3.5};
const LOW_GROUND_DUMMY = {x: 4.5, y: 3.5};
const PLATFORM_EDGE = 10;
const PLATFORM = 1;
// Far enough onto the platform to stand on it, and still well short of the dummy there, so nothing stands between the player
// and the dummy behind them.
const JUST_ONTO_THE_PLATFORM = PLATFORM_EDGE + 0.6;
// Once on the platform the game is held and run in short steps: the walk is stopped by the game's own time, and each shot is run until it lands. A walk stopped by
// a test that looks every so often ran on while the machine was busy, and the player ended past the dummy on the platform, which then took the shot meant for
// the one behind them (seen at x = 13 with the dummy at 12.5).
const WALK_WATCH = {maxSeconds: 5, stepSeconds: 0.02};
const SHOT_WATCH = {maxSeconds: 5, stepSeconds: 0.05};
// One frame at a time for six frames (120 ms), which is longer than a shot lives against the face a tile and a half ahead; then long enough for it surely to have ended.
const A_FRAME_SECONDS = 0.02;
const FRAMES_LOOKED_AT = 6;
const LONGER_THAN_THE_SHOT_LIVES_SECONDS = 1;

given("a player on the low ground, a dummy on the platform ahead and another on the low ground behind them", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.startHeights();
  });

  when("the player shoots at the dummy on the platform", () => {
    let health: number | undefined;
    let shotLeft = false;

    beforeEach(async ({gunsmith}) => {
      // Held, because the shot lives for under a tenth of a second (the face is a tile and a half away) and a test that looks every so often missed it on a busy machine.
      await gunsmith.holdTheGame();
      health = await gunsmith.dummies.getHealthAt(PLATFORM_DUMMY);

      await gunsmith.player.aimAtTile(PLATFORM_DUMMY);
      await gunsmith.player.fire();

      // The click is taken up by the first frame or the second, so the shot is looked for at every frame for longer than it lives (about 75 ms), not at one.
      for (let frame = 0; frame < FRAMES_LOOKED_AT; frame += 1) {
        await gunsmith.runGameFor(A_FRAME_SECONDS);
        shotLeft = shotLeft || (await gunsmith.bullets.count()) > 0;
      }
      await gunsmith.runGameFor(LONGER_THAN_THE_SHOT_LIVES_SECONDS);
    });

    then("the shot is stopped by the platform's face and the dummy is not hurt", async ({gunsmith}) => {
      expect(shotLeft).toBe(true);
      expect(await gunsmith.bullets.count()).toBe(0);
      expect(await gunsmith.dummies.getHealthAt(PLATFORM_DUMMY)).toBe(health);
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
      await gunsmith.holdTheGame();
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

      then("the dummy is hurt, because a shot from higher ground flies out over the low ground", async ({gunsmith}) => {
        expect(health).toBeDefined();
        expect(await gunsmith.dummies.getHealthAt(LOW_GROUND_DUMMY)).toBeLessThan(health ?? 0);
      });
    });
  });
});
