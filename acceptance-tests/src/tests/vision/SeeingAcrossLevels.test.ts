import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

// The player starts at (8.5, 3.5) on the low ground, facing east. A platform one level up fills the east end from x = 10, and
// one stair, on the player's row at x = 9, climbs onto it. A dummy stands on the platform four tiles east of the player, two and
// a half tiles back from its edge; another stands at the platform's edge, half a tile from it, off the player's row; a third
// stands on the low ground four tiles west. All are well inside the rifle's reach, so what hides one is the height and nothing
// else. Between two levels sight crosses raised floor only within a tile of the higher end: to look down off a platform you
// stand at its edge, and there you are seen from below. A second platform on the same level fills the north-west corner (x 1 to 4,
// y 4 to 6), its stair at x 4, with low ground between the two.
const PLATFORM_DUMMY = {x: 12.5, y: 3.5};
const EDGE_DUMMY = {x: 10.5, y: 1.5};
const LOW_GROUND_DUMMY = {x: 4.5, y: 3.5};
const PLATFORM_EDGE = 10;
const PLATFORM = 1;
// The middle of the far platform, and a stretch of the player's own platform in front of them, clear of the edge, the stair's landing
// and the dummy at the edge, to compare it with.
const FAR_PLATFORM = {x: 2.5, y: 5};
const OWN_PLATFORM = {x: 10.5, y: 4.3};
// Drawn in detail means as bright as the player's own floor; under the fog it shows about half as bright.
const CLEAR_ABOVE = 0.97;
// Half a tile onto the platform (a held walk ends at most one step past it), and well back from the edge.
const AT_THE_EDGE = PLATFORM_EDGE + 0.5;
const BACK_FROM_THE_EDGE = PLATFORM_EDGE + 1.5;
const WALK_WATCH = {maxSeconds: 5, stepSeconds: 0.02};
// Long enough for a new aim to reach the game, which turns the player on its next step.
const TURN_SECONDS = 0.1;

given("a player on the low ground, a dummy on the platform ahead and another on the low ground behind them", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.scenario.startHeights();
  });

  when("the player faces the dummy on the platform", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.player.aimAtTile(PLATFORM_DUMMY);
      await gunsmith.clock.waitForGameSeconds(0.3);
    });

    then(
      "the player does not see it, though it is in front of them and within reach, because it stands back from the platform's edge",
      async ({gunsmith}) => {
        const player = await gunsmith.player.getPosition();
        const view = await gunsmith.vision.getView();

        expect(Math.hypot(PLATFORM_DUMMY.x - player.x, PLATFORM_DUMMY.y - player.y)).toBeLessThan(view.range);
        expect(await gunsmith.dummies.isSeenAt(PLATFORM_DUMMY)).toBe(false);
      },
    );
  });

  when("the player faces the dummy at the platform's edge", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.player.aimAtTile(EDGE_DUMMY);
    });

    then("the player sees it, because it stands within a tile of the edge", async ({gunsmith}) => {
      await expect.poll(() => gunsmith.dummies.isSeenAt(EDGE_DUMMY)).toBe(true);
    });
  });

  when("the player faces the dummy on the low ground", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.player.aimAtTile(LOW_GROUND_DUMMY);
    });

    then("the player sees it, as on any flat ground", async ({gunsmith}) => {
      await expect.poll(() => gunsmith.dummies.isSeenAt(LOW_GROUND_DUMMY)).toBe(true);
    });
  });

  when("the player climbs the stair to the platform's edge", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.clock.holdTheGame();
      await gunsmith.player.walkUntilPast({heading: "east", limit: AT_THE_EDGE, watch: WALK_WATCH});
    });

    then("the player is on the platform", async ({gunsmith}) => {
      expect(await gunsmith.player.getLevel()).toBe(PLATFORM);
    });

    when("the player faces the dummy there", () => {
      beforeEach(async ({gunsmith}) => {
        await gunsmith.player.aimAtTile(PLATFORM_DUMMY);
        await gunsmith.clock.runGameFor(TURN_SECONDS);
      });

      then("the player sees it, now that they stand as high as it", async ({gunsmith}) => {
        expect(await gunsmith.dummies.isSeenAt(PLATFORM_DUMMY)).toBe(true);
      });
    });

    when("the player faces back down at the dummy on the low ground", () => {
      beforeEach(async ({gunsmith}) => {
        await gunsmith.player.aimAtTile(LOW_GROUND_DUMMY);
        await gunsmith.clock.runGameFor(TURN_SECONDS);
      });

      then("the player sees it, because from the edge higher ground sees down", async ({gunsmith}) => {
        expect(await gunsmith.dummies.isSeenAt(LOW_GROUND_DUMMY)).toBe(true);
      });
    });

    when("the player steps back from the edge and faces the dummy on the low ground", () => {
      beforeEach(async ({gunsmith}) => {
        await gunsmith.player.walkUntilPast({heading: "east", limit: BACK_FROM_THE_EDGE, watch: WALK_WATCH});
        await gunsmith.player.aimAtTile(LOW_GROUND_DUMMY);
        await gunsmith.clock.runGameFor(TURN_SECONDS);
      });

      then("the player does not see it, because the platform's edge hides the low ground below", async ({gunsmith}) => {
        expect(await gunsmith.player.getLevel()).toBe(PLATFORM);
        expect(await gunsmith.dummies.isSeenAt(LOW_GROUND_DUMMY)).toBe(false);
      });
    });

    when("the player steps back from the edge and faces the far platform across the low ground", () => {
      beforeEach(async ({gunsmith}) => {
        await gunsmith.player.walkUntilPast({heading: "east", limit: BACK_FROM_THE_EDGE, watch: WALK_WATCH});
        await gunsmith.player.aimAtTile(FAR_PLATFORM);
        await gunsmith.clock.runGameFor(TURN_SECONDS);
      });

      then(
        "the far platform is drawn as clearly as the player's own, because it is as high as them",
        async ({gunsmith}) => {
          expect(await gunsmith.arena.getFloorBrightnessAt(FAR_PLATFORM, OWN_PLATFORM)).toBeGreaterThan(CLEAR_ABOVE);
        },
      );
    });
  });
});
