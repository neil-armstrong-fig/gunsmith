import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

// The player is drawn on the canvas, which is not in the DOM, so this spec reads what a player sees (a screenshot) over the place the
// game's own state hook says the player stands. It looks for art's drawing (`docs/art/asset-reference/players/`), not just a team
// colour: the placeholder disc this replaced was exactly the team's blue, so only the neutral grey of the body says the drawing is there.
//
// Measured against the drawing, over a grid with a gap of 0.025 tile (the same every run): standing, 413 places show the body's grey and 24 the
// stripe; crouched, 146 show the grey and 16 the stripe. The thresholds sit well away from those, and from the old placeholder disc, which
// showed no grey at all and no blue near the team's (tone mapping had paled it).
const STANDING_BODY_AT_LEAST = 300;
const STRIPE_AT_MOST = 60;
const CROUCHED_BODY_AT_LEAST = 100;
const CROUCHED_BODY_BELOW_FRACTION_OF_STANDING = 0.7;
const ALL_COMPASS_POINTS = 8;

given("a sparring match has just begun", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.scenario.startSparring();
  });

  when("a player looks at their own character, standing", () => {
    then("the body is drawn in its neutral grey", async ({gunsmith}) => {
      expect((await gunsmith.player.getLookOnScreen()).bodyPixels).toBeGreaterThanOrEqual(STANDING_BODY_AT_LEAST);
    });

    then("the team's blue is a small stripe on it, not the whole character", async ({gunsmith}) => {
      const {teamPixels} = await gunsmith.player.getLookOnScreen();

      expect(teamPixels).toBeGreaterThan(0);
      expect(teamPixels).toBeLessThanOrEqual(STRIPE_AT_MOST);
    });

    then("the body is as big as the circle that walls stop, and centred on it", async ({gunsmith}) => {
      expect((await gunsmith.player.getLookOnScreen()).outlinePoints).toBe(ALL_COMPASS_POINTS);
    });

    then("the placeholder's barrel is gone once the drawing is there", async ({gunsmith}) => {
      expect((await gunsmith.player.getLookOnScreen()).placeholderPixels).toBe(0);
    });
  });

  // The drawing faces east at rest and the game turns it about the body's centre. The body is round, so its colours and its outline look the same
  // whichever way it turns: the hand is what shows which way, a third of a tile ahead of the centre.
  when.each(
    [
      {way: "north", tile: {x: 10.5, y: 11.5}},
      {way: "west", tile: {x: 2.5, y: 6.5}},
      {way: "south", tile: {x: 10.5, y: 1.5}},
      {way: "east", tile: {x: 18.5, y: 6.5}},
    ],
    ({way}) => `the player aims ${way}`,
    ({tile, way}) => {
      beforeEach(async ({gunsmith}) => {
        await gunsmith.player.aimAtTile(tile);
      });

      then(`the hand is drawn on the ${way} side of the body`, async ({gunsmith}) => {
        await expect.poll(() => gunsmith.player.isHandOnTheFacingSide()).toBe(true);
      });
    },
  );

  when("the player crouches", () => {
    let standingBodyPixels = 0;

    beforeEach(async ({gunsmith}) => {
      standingBodyPixels = (await gunsmith.player.getLookOnScreen()).bodyPixels;

      const {range} = await gunsmith.vision.getView();
      await gunsmith.player.crouch();
      await expect.poll(async () => (await gunsmith.vision.getView()).range).toBeGreaterThan(range);
    });

    then("the body is drawn smaller than when standing", async ({gunsmith}) => {
      await expect
        .poll(async () => (await gunsmith.player.getLookOnScreen()).bodyPixels)
        .toBeLessThan(standingBodyPixels * CROUCHED_BODY_BELOW_FRACTION_OF_STANDING);
    });

    then("the body is still drawn, only smaller", async ({gunsmith}) => {
      // The drawing follows the game by a frame, so wait for it to have shrunk before asking that something is left of it.
      await expect
        .poll(async () => (await gunsmith.player.getLookOnScreen()).bodyPixels)
        .toBeLessThan(standingBodyPixels * CROUCHED_BODY_BELOW_FRACTION_OF_STANDING);

      expect((await gunsmith.player.getLookOnScreen()).bodyPixels).toBeGreaterThanOrEqual(CROUCHED_BODY_AT_LEAST);
    });
  });
});

// The pictures are decoded after the page opens, and the arena says when they have been (`data-sprites-ready`). A spec that read the screen
// before then would see the placeholder, so this holds the pictures back until the spec lets them through, to show the arena does not say it
// is ready while they are missing (and not leave that to a race a fast machine always wins).
given("a sparring match whose pictures are held back on their way to the page", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.scenario.startSparringWithHeldPictures();
  });

  then("the arena is not ready while it is still waiting for them", async ({gunsmith}) => {
    expect(await gunsmith.arena.isWaitingForPictures()).toBe(true);
  });

  when("the pictures arrive", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.scenario.releasePictures();
    });

    then("the player is drawn as art made them, not as the placeholder", async ({gunsmith}) => {
      const look = await gunsmith.player.getLookOnScreen();

      expect(look.bodyPixels).toBeGreaterThanOrEqual(STANDING_BODY_AT_LEAST);
      expect(look.placeholderPixels).toBe(0);
    });
  });
});

// One missing file must not leave the page waiting for ever, or the game unplayable: the player is drawn as the placeholder disc and the match goes on.
given("a sparring match whose pictures are missing from the server", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.scenario.startSparringWithMissingPictures();
  });

  when("the page says it is ready", () => {
    then("the player is drawn as the placeholder disc and barrel, and the match is on", async ({gunsmith}) => {
      const look = await gunsmith.player.getLookOnScreen();

      expect(look.placeholderPixels).toBeGreaterThan(0);
      expect(look.bodyPixels).toBeLessThan(STANDING_BODY_AT_LEAST);
    });
  });
});
