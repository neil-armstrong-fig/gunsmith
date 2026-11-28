import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

// The opponent is drawn on the canvas, which is not in the DOM, so this spec reads what a player sees (a screenshot) over the place the game's own
// state hook says the opponent stands, as `DrawingThePlayer` does for the player. Sparring's opponent stands still. It is art's drawing, as the
// player's is (`docs/art/asset-reference/players/`), with the other team's mark: two orange stripes in place of one blue.
//
// Measured against the drawing, over a grid with a gap of 0.025 tile (the same every run): 420 places show the body's grey and 18 the stripes.
const BODY_AT_LEAST = 300;
const STRIPES_AT_MOST = 60;
const ALL_COMPASS_POINTS = 8;

// The player starts at (10.5, 6.5) in the sparring arena and the opponent stands six tiles east on the same row, which is
// clear floor all the way. A tile far to the west, on that row, is behind the player.
const BEHIND_THE_PLAYER = {x: 2.5, y: 6.5};

given("a sparring match has just begun", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.scenario.startSparring();
  });

  when("the player faces the opponent", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.player.aimAtTile(await gunsmith.opponent.get());
      await expect.poll(() => gunsmith.vision.isOpponentSeen()).toBe(true);
    });

    then("the opponent's body is drawn in its neutral grey", async ({gunsmith}) => {
      await expect
        .poll(async () => (await gunsmith.opponent.getLookOnScreen()).bodyPixels)
        .toBeGreaterThanOrEqual(BODY_AT_LEAST);
    });

    then("the other team's orange is two small stripes on it, not the whole fighter", async ({gunsmith}) => {
      await expect
        .poll(async () => (await gunsmith.opponent.getLookOnScreen()).bodyPixels)
        .toBeGreaterThanOrEqual(BODY_AT_LEAST);

      const {teamPixels} = await gunsmith.opponent.getLookOnScreen();

      expect(teamPixels).toBeGreaterThan(0);
      expect(teamPixels).toBeLessThanOrEqual(STRIPES_AT_MOST);
    });

    then("the opponent's body is as big as the circle that walls stop, and centred on it", async ({gunsmith}) => {
      await expect.poll(async () => (await gunsmith.opponent.getLookOnScreen()).outlinePoints).toBe(ALL_COMPASS_POINTS);
    });

    then("the placeholder's barrel is gone once the drawing is there", async ({gunsmith}) => {
      await expect
        .poll(async () => (await gunsmith.opponent.getLookOnScreen()).bodyPixels)
        .toBeGreaterThanOrEqual(BODY_AT_LEAST);

      expect((await gunsmith.opponent.getLookOnScreen()).placeholderPixels).toBe(0);
    });
  });

  when("the player turns away, so the opponent is outside what they see", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.player.aimAtTile(BEHIND_THE_PLAYER);
      await expect.poll(() => gunsmith.vision.isOpponentSeen()).toBe(false);
    });

    then("none of the opponent is drawn: no body, no stripes, no outline, no placeholder", async ({gunsmith}) => {
      // The drawing follows the game by a frame, so wait for the body to be gone before asking that all of it is.
      await expect.poll(async () => (await gunsmith.opponent.getLookOnScreen()).bodyPixels).toBe(0);

      expect(await gunsmith.opponent.getLookOnScreen()).toEqual({
        bodyPixels: 0,
        teamPixels: 0,
        placeholderPixels: 0,
        outlinePoints: 0,
      });
    });

    when("the player turns back to face it", () => {
      beforeEach(async ({gunsmith}) => {
        await gunsmith.player.aimAtTile(await gunsmith.opponent.get());
        await expect.poll(() => gunsmith.vision.isOpponentSeen()).toBe(true);
      });

      then("the opponent is drawn again", async ({gunsmith}) => {
        await expect
          .poll(async () => (await gunsmith.opponent.getLookOnScreen()).bodyPixels)
          .toBeGreaterThanOrEqual(BODY_AT_LEAST);
      });
    });
  });
});
