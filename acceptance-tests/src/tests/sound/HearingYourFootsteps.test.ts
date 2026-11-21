import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

const SOFT_STEP = "sfx-footstep";

given("the player is on the practice range", () => {
  when("they walk upright for just under one second and stop", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.holdTheGame();
      await gunsmith.player.startWalking("west");
      await gunsmith.runGameFor(0.98);
      await gunsmith.player.stopWalking("west");
      await gunsmith.runGameFor(0.8);
    });

    then("a soft footfall plays at the start and the regular steps stop with movement", async ({gunsmith}) => {
      await expect
        .poll(() => gunsmith.sound.getPlays(SOFT_STEP))
        .toMatchObject([
          {contextState: "running", looping: false},
          {contextState: "running", looping: false},
          {contextState: "running", looping: false},
        ]);
    });
  });

  when("they move with two short upright taps separated by a pause", () => {
    let startX = 0;
    let afterFirstTap = 0;

    beforeEach(async ({gunsmith}) => {
      await gunsmith.holdTheGame();
      startX = (await gunsmith.player.getPosition()).x;
      await gunsmith.player.startWalking("west");
      await gunsmith.runGameFor(0.06);
      await gunsmith.player.stopWalking("west");
      afterFirstTap = (await gunsmith.player.getPosition()).x;
      await gunsmith.runGameFor(0.08);
      await gunsmith.player.startWalking("west");
      await gunsmith.runGameFor(0.06);
      await gunsmith.player.stopWalking("west");
    });

    then("each short movement produces a footfall", async ({gunsmith}) => {
      expect(afterFirstTap).toBeLessThan(startX);
      expect((await gunsmith.player.getPosition()).x).toBeLessThan(afterFirstTap);
      await expect.poll(() => gunsmith.sound.getPlays(SOFT_STEP)).toHaveLength(2);
    });
  });

  when("they walk crouched for just under one second", () => {
    let startX = 0;

    beforeEach(async ({gunsmith}) => {
      await gunsmith.holdTheGame();
      startX = (await gunsmith.player.getPosition()).x;
      await gunsmith.player.crouch();
      await gunsmith.player.startWalking("west");
      await gunsmith.runGameFor(0.98);
      await gunsmith.player.stopWalking("west");
      await gunsmith.player.standUp();
    });

    then("they move silently", async ({gunsmith}) => {
      expect((await gunsmith.player.getPosition()).x).toBeLessThan(startX);
      expect(await gunsmith.sound.getPlays(SOFT_STEP)).toHaveLength(0);
    });
  });

  when("they reach the west wall while muted, then unmute while still pushing against it", () => {
    let wallX = 0;

    beforeEach(async ({gunsmith}) => {
      await gunsmith.sound.toggleMute();
      await gunsmith.holdTheGame();
      await gunsmith.player.startWalking("west");
      await gunsmith.runGameFor(2.4);
      wallX = (await gunsmith.player.getPosition()).x;
      await gunsmith.sound.toggleMute();
      await gunsmith.runGameFor(1);
      await gunsmith.player.stopWalking("west");
    });

    then("the wall stops the player and no footfalls play", async ({gunsmith}) => {
      expect(wallX).toBeLessThan(2);
      expect((await gunsmith.player.getPosition()).x).toBeCloseTo(wallX, 5);
      expect(await gunsmith.sound.getPlays(SOFT_STEP)).toHaveLength(0);
    });
  });
});
