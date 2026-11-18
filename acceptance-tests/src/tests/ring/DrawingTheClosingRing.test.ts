import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

// The ring is drawn by a shader on the canvas, which is not in the DOM, so this spec reads what a player sees (a screenshot) at
// the places the game's own state hook says the ring is. Sparring's opponent stands still, so only the ring moves. The ring closes
// slowly here (a little over half a tile a second) so that the half second between reading it and looking at it moves its edge
// by well under the width of the bright line (0.12 tiles) searched for below.
const DELAY_SECONDS = 3;
const CLOSING_SECONDS = 30;
const SEED = 14;

// Once the ring has come in this far, its edge on the west side is inside the arena, on the open row through the centre.
const EDGE_IN_VIEW_BELOW_TILES = 14;

given("a sparring match whose ring has closed in until its edge is on the screen", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.startClosingRing({seed: SEED, delaySeconds: DELAY_SECONDS, closingSeconds: CLOSING_SECONDS});
    await gunsmith.ring.waitForRadiusBelow(EDGE_IN_VIEW_BELOW_TILES, DELAY_SECONDS + CLOSING_SECONDS);
  });

  when("a player looks at the screen", () => {
    then("the browser has reported no shader error", ({gunsmith}) => {
      expect(gunsmith.ring.getShaderErrors()).toEqual([]);
    });

    then("a bright red line is drawn where the game says the ring's edge is", async ({gunsmith}) => {
      expect(await gunsmith.ring.isEdgeDrawn()).toBe(true);
    });

    then("inside the ring is not tinted red", async ({gunsmith}) => {
      expect(await gunsmith.ring.isInsideUntinted()).toBe(true);
    });

    then("outside the ring is tinted red", async ({gunsmith}) => {
      expect(await gunsmith.ring.isOutsideTinted()).toBe(true);
    });
  });
});

// A ring that has not begun to close covers the whole arena, and its starting radius reaches exactly to the corner farthest from its centre, so a drawing that
// only skips "the ring is bigger than the arena" shows a wedge of the bright edge in that corner from the first frame. Nothing of the ring is to be drawn
// until its timer has run out and it starts to move.
const LATE_DELAY_SECONDS = 60;
const SECONDS_WATCHED = 1;

given("a sparring match whose ring does not start to close for a minute", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.startClosingRing({seed: SEED, delaySeconds: LATE_DELAY_SECONDS, closingSeconds: CLOSING_SECONDS});
  });

  when("a second of the round has been played and the ring has not started", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.waitForGameSeconds(SECONDS_WATCHED);
    });

    then("no red of the ring is drawn in any corner of the arena", async ({gunsmith}) => {
      expect(await gunsmith.ring.isRedDrawnInAnyCorner()).toBe(false);
    });
  });
});
