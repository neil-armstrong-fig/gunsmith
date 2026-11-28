import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

// Against a player who stands still the opponent has won a round within 9.4 game seconds on every one of 40 seeds measured
// in the engine, so fifteen is the longest this spec waits for a round to be lost.
const LONGEST_LOSS_SECONDS = 15;

// `art`'s precision crosshair (`docs/art/concepts/aim-reticle/`): a 32 by 32 picture for an ordinary screen and a 64 by 64 one for a
// sharp screen (twice the pixels for each CSS pixel), whose middle is the mouse position: 16 CSS pixels in from the corner.
const ORDINARY_PICTURE = {scale: 1, size: {width: 32, height: 32}};
const SHARP_PICTURE = {scale: 2, size: {width: 64, height: 64}};
const RETICLE_HOTSPOT = {x: 16, y: 16};

given("the game has opened", () => {
  when("the mouse is over the open arena", () => {
    then("the cursor has a 32 by 32 picture for an ordinary screen", async ({gunsmith}) => {
      const cursor = await gunsmith.arena.getCursorOver("the open arena");

      expect(cursor.image?.pictures).toContainEqual(ORDINARY_PICTURE);
    });

    then("the cursor has a 64 by 64 picture for a sharp screen, so it is not soft there", async ({gunsmith}) => {
      const cursor = await gunsmith.arena.getCursorOver("the open arena");

      expect(cursor.image?.pictures).toContainEqual(SHARP_PICTURE);
    });

    then("the mouse position is the middle of each picture", async ({gunsmith}) => {
      const cursor = await gunsmith.arena.getCursorOver("the open arena");

      expect(cursor.image?.hotspot).toEqual(RETICLE_HOTSPOT);
      expect(
        cursor.image?.pictures.map(({scale, size}) => ({x: size.width / 2 / scale, y: size.height / 2 / scale})),
      ).toEqual([RETICLE_HOTSPOT, RETICLE_HOTSPOT]);
    });

    then("a plain crosshair is the fallback if the pictures cannot be used", async ({gunsmith}) => {
      const cursor = await gunsmith.arena.getCursorOver("the open arena");

      expect(cursor.keyword).toBe("crosshair");
    });
  });

  when("the mouse is over the ammunition readout", () => {
    then("it is still the reticle, so the readout is no dead zone for aiming", async ({gunsmith}) => {
      const cursor = await gunsmith.arena.getCursorOver("the ammunition readout");

      expect(cursor.image).toEqual({pictures: [ORDINARY_PICTURE, SHARP_PICTURE], hotspot: RETICLE_HOTSPOT});
    });
  });
});

given("a duel has just begun", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.scenario.startDuel();
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
