import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

// A person who asks for reduced motion (`prefers-reduced-motion`, or `?reducedMotion=1` to look at it) keeps everything that says what happened and loses what
// moves: the camera does not shake, the brackets of a hit do not open outward, and the part of the health bar a bullet took does not trail behind it, so the bar
// is simply the health. Art's brackets are 25 of the study's pixels out and open up to 8 more over 180 ms, so how far out the left one shows, a little over
// halfway through, says whether they opened.
const TRAIL = "health-trail";
const HIT_WATCH = {maxSeconds: 10, stepSeconds: 0.02};
const PART_WAY_SECONDS = 0.03;
const MOST_OF_THE_FLASH_SECONDS = 0.15;
const WHERE_THE_BRACKET_STANDS = 25;
// The bar is 3 pixels thick and blurs at its edge, so the farthest place that shows coral is a little beyond where it stands.
const A_BRACKET_THAT_STAYED_REACHES_AT_MOST = WHERE_THE_BRACKET_STANDS + 3;
const A_BRACKET_THAT_OPENED_REACHES_AT_LEAST = WHERE_THE_BRACKET_STANDS + 5;

given("a duel opened with a camera that does not shake and normal motion, held still", () => {
  beforeEach(async ({gunsmith}) => {
    gunsmith.keepTheCameraStill();
    await gunsmith.startDuel();
    await gunsmith.holdTheGame();
  });

  when("a bullet has hurt the player and the brackets are most of the way through their flash", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.player.runUntilHurt(HIT_WATCH);
      await gunsmith.runGameFor(MOST_OF_THE_FLASH_SECONDS);
    });

    then("the brackets have opened outward", async ({gunsmith}) => {
      expect((await gunsmith.player.getDamageOnScreen()).leftBracketReachPixels).toBeGreaterThanOrEqual(
        A_BRACKET_THAT_OPENED_REACHES_AT_LEAST,
      );
    });
  });
});

given("a duel opened asking for reduced motion, held still", () => {
  beforeEach(async ({gunsmith}) => {
    gunsmith.askForReducedMotion();
    await gunsmith.startDuel();
    await gunsmith.holdTheGame();
  });

  when("a bullet has just hurt the player and a shake would be part way through", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.player.runUntilHurt(HIT_WATCH);
      await gunsmith.runGameFor(PART_WAY_SECONDS);
    });

    then("the camera does not move the picture", async ({gunsmith}) => {
      expect(await gunsmith.camera.getShake()).toEqual({x: 0, y: 0});
    });

    then("the brackets of the hit are still there", async ({gunsmith}) => {
      const damage = await gunsmith.player.getDamageOnScreen();

      expect(damage.leftBracketPoints).toBeGreaterThan(0);
      expect(damage.rightBracketPoints).toBeGreaterThan(0);
    });
  });

  when("a bullet has hurt the player and the brackets are most of the way through their flash", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.player.runUntilHurt(HIT_WATCH);
      await gunsmith.runGameFor(MOST_OF_THE_FLASH_SECONDS);
    });

    then("the brackets are where they started, not opened outward", async ({gunsmith}) => {
      const {leftBracketReachPixels} = await gunsmith.player.getDamageOnScreen();

      expect(leftBracketReachPixels).toBeGreaterThan(0);
      expect(leftBracketReachPixels).toBeLessThanOrEqual(A_BRACKET_THAT_STAYED_REACHES_AT_MOST);
    });
  });
});

given("a duel opened asking for reduced motion", () => {
  let fullHealth = 0;

  beforeEach(async ({gunsmith}) => {
    gunsmith.askForReducedMotion();
    await gunsmith.startDuel();
    fullHealth = await gunsmith.player.getHealth();
  });

  when("the opponent has shot the player", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.player.waitForHealthBelow(fullHealth);
      await gunsmith.waitForGameSeconds(1);
    });

    then("the health bar shows the health at once, with no amber trail sliding behind it", async ({gunsmith}) => {
      expect(await gunsmith.hud.getMotions(TRAIL)).toHaveLength(0);
    });
  });
});

given("a duel, with the browser saying the person prefers reduced motion, held still", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.preferReducedMotion();
    await gunsmith.startDuel();
    await gunsmith.holdTheGame();
  });

  when("a bullet has just hurt the player and a shake would be part way through", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.player.runUntilHurt(HIT_WATCH);
      await gunsmith.runGameFor(PART_WAY_SECONDS);
    });

    then("the camera does not move the picture", async ({gunsmith}) => {
      expect(await gunsmith.camera.getShake()).toEqual({x: 0, y: 0});
    });
  });
});
