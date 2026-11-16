import type {DummySnapshot} from "@gunsmith/shared/state-hook/types/DummySnapshot";
import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

// A dummy is drawn on the canvas, which is not in the DOM, so this spec reads what a player sees (a screenshot) over the place the game's own state hook
// says it stands, as `DrawingThePlayer` does for the player. It is art's practice dummy (`docs/art/asset-reference/players/dummy/`): the neutral grey body, a gold ring
// and centre dot, a cross, and the grey-blue outline. The placeholder it replaces was a flat orange disc, so grey and gold say the drawing is there.
//
// Measured against the drawing, over a grid with a gap of 0.025 tile (the same every run) the thresholds sit well away from.
const BODY_AT_LEAST = 300;
const GOLD_AT_MOST = 80;
const ALL_COMPASS_POINTS = 8;
const HURT_BELOW_HEALTH = 60;
const HURT_BODY_BELOW_FRACTION_OF_WHOLE = 0.5;

given("a match has just begun", () => {
  let dummy: DummySnapshot;

  beforeEach(async ({gunsmith}) => {
    const [first] = await gunsmith.dummies.getAll();
    if (!first) {
      throw new Error("The practice range has no dummy.");
    }

    dummy = first;
  });

  when("the player faces a dummy and sees it", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.player.aimAtTile(dummy);
      await expect.poll(() => gunsmith.dummies.isSeenAt(dummy)).toBe(true);
    });

    then("the dummy's body is drawn in its neutral grey", async ({gunsmith}) => {
      await expect
        .poll(async () => (await gunsmith.dummies.getLookOnScreen(dummy)).bodyPixels)
        .toBeGreaterThanOrEqual(BODY_AT_LEAST);
    });

    then("its gold ring and centre are small marks on it, not the whole dummy", async ({gunsmith}) => {
      await expect
        .poll(async () => (await gunsmith.dummies.getLookOnScreen(dummy)).bodyPixels)
        .toBeGreaterThanOrEqual(BODY_AT_LEAST);

      const {teamPixels} = await gunsmith.dummies.getLookOnScreen(dummy);

      expect(teamPixels).toBeGreaterThan(0);
      expect(teamPixels).toBeLessThanOrEqual(GOLD_AT_MOST);
    });

    then("the dummy is as big as the circle a bullet must touch, and centred on it", async ({gunsmith}) => {
      await expect
        .poll(async () => (await gunsmith.dummies.getLookOnScreen(dummy)).outlinePoints)
        .toBe(ALL_COMPASS_POINTS);
    });
  });

  // Fog: a dummy outside what the player sees is not drawn at all.
  when("the player turns away, so the dummy is outside what they see", () => {
    beforeEach(async ({gunsmith}) => {
      const player = await gunsmith.player.getPosition();

      await gunsmith.player.aimAtTile({x: player.x + (player.x - dummy.x), y: player.y + (player.y - dummy.y)});
      await expect.poll(() => gunsmith.dummies.isSeenAt(dummy)).toBe(false);
    });

    then("none of the dummy is drawn", async ({gunsmith}) => {
      await expect.poll(async () => (await gunsmith.dummies.getLookOnScreen(dummy)).bodyPixels).toBe(0);

      expect((await gunsmith.dummies.getLookOnScreen(dummy)).teamPixels).toBe(0);
    });
  });

  // A hurt dummy fades toward a dark tint, so a player can read how much it has left.
  when("the player hurts the dummy without felling it", () => {
    let wholeBodyPixels = 0;

    beforeEach(async ({gunsmith}) => {
      await gunsmith.player.aimAtTile(dummy);
      await expect.poll(() => gunsmith.dummies.isSeenAt(dummy)).toBe(true);
      await expect
        .poll(async () => (await gunsmith.dummies.getLookOnScreen(dummy)).bodyPixels)
        .toBeGreaterThanOrEqual(BODY_AT_LEAST);

      wholeBodyPixels = (await gunsmith.dummies.getLookOnScreen(dummy)).bodyPixels;

      await gunsmith.player.startFiring();
      await gunsmith.dummies.waitForHealthBelow(dummy, HURT_BELOW_HEALTH);
      await gunsmith.player.stopFiring();
    });

    then("the dummy is drawn dimmer than a whole one", async ({gunsmith}) => {
      expect(await gunsmith.dummies.getHealthAt(dummy)).toBeDefined();

      await expect
        .poll(async () => (await gunsmith.dummies.getLookOnScreen(dummy)).bodyPixels)
        .toBeLessThan(wholeBodyPixels * HURT_BODY_BELOW_FRACTION_OF_WHOLE);
    });
  });
});
