import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

// Against a player who stands still the opponent has won a round within 9.4 game seconds on every one of 40 seeds measured
// in the engine, so fifteen is the longest this spec waits for a round to be lost.
const LONGEST_LOSS_SECONDS = 15;

// `art`'s precision crosshair (`docs/art/concepts/aim-reticle/`): a 32 by 32 picture whose centre is the mouse position.
const RETICLE_SIZE = {width: 32, height: 32};
const RETICLE_HOTSPOT = {x: 16, y: 16};

given("the game has opened", () => {
  when("the mouse is over the open arena", () => {
    then("the cursor is a 32 by 32 picture", async ({gunsmith}) => {
      const cursor = await gunsmith.arena.getCursorOver("the open arena");

      expect(cursor.image?.size).toEqual(RETICLE_SIZE);
    });

    then("the mouse position is the middle of that picture", async ({gunsmith}) => {
      const cursor = await gunsmith.arena.getCursorOver("the open arena");

      expect(cursor.image?.hotspot).toEqual(RETICLE_HOTSPOT);
    });

    then("a plain crosshair is the fallback if the picture cannot be used", async ({gunsmith}) => {
      const cursor = await gunsmith.arena.getCursorOver("the open arena");

      expect(cursor.keyword).toBe("crosshair");
    });
  });

  when("the mouse is over the ammunition readout", () => {
    then("it is still the reticle, so the readout is no dead zone for aiming", async ({gunsmith}) => {
      const cursor = await gunsmith.arena.getCursorOver("the ammunition readout");

      expect(cursor.image).toEqual({size: RETICLE_SIZE, hotspot: RETICLE_HOTSPOT});
    });
  });
});

given("a duel has just begun", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.startDuel();
  });

  when("the player stands still and loses the first round", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.round.waitForState("lost", LONGEST_LOSS_SECONDS);
    });

    then("the mouse over the banner's backdrop is an ordinary pointer, not the reticle", async ({gunsmith}) => {
      const cursor = await gunsmith.arena.getCursorOver("the round banner");

      expect(cursor.image).toBeUndefined();
    });

    then("the mouse over the banner's button is an ordinary pointer, not the reticle", async ({gunsmith}) => {
      const cursor = await gunsmith.arena.getCursorOver("the round banner's button");

      expect(cursor.image).toBeUndefined();
    });
  });
});
