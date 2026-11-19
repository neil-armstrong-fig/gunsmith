import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

// A weapon prompt may be this many characters (the pre-check's limit: 150 tokens at four characters to a token).
const WEAPON_PROMPT_LIMIT = 600;

given("the workshop is open on the practice range", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.workshop.open();
  });

  when("the player writes a weapon and presses Make", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.workshop.typeThePrompt("a fast little submachine gun");
      await gunsmith.workshop.make();
    });

    then("the result card names the weapon", async ({gunsmith}) => {
      expect((await gunsmith.workshop.getResult()).name).not.toBe("");
    });

    then("the card shows its power rating, from 1 to 100", async ({gunsmith}) => {
      const {rating} = await gunsmith.workshop.getResult();

      expect(rating).toBeGreaterThanOrEqual(1);
      expect(rating).toBeLessThanOrEqual(100);
    });

    then("the card lists the stats a fighter needs", async ({gunsmith}) => {
      const {stats} = await gunsmith.workshop.getResult();

      expect(Object.keys(stats)).toEqual(["Damage", "Shots a second", "Magazine", "Reserve", "Reload", "Vision"]);
      for (const value of Object.values(stats)) {
        expect(value).toMatch(/^\d/);
      }
    });

    then("the card draws the weapon, a picture that has loaded", async ({gunsmith}) => {
      const {pictureLoaded, pictureAddress} = await gunsmith.workshop.getResult();

      expect(pictureAddress).toMatch(/\.svg$/);
      expect(pictureLoaded).toBe(true);
    });

    then("the prompt is kept for editing", async ({gunsmith}) => {
      expect(await gunsmith.workshop.getPrompt()).toBe("a fast little submachine gun");
    });
  });

  when("the player makes a fast weapon and then a long-range one", () => {
    let fastShotsASecond = 0;
    let fastDamage = 0;
    let fastPicture = "";
    let fastRating = 0;
    let longRangeShotsASecond = 0;
    let longRangeDamage = 0;
    let longRangePicture = "";
    let longRangeRating = 0;

    beforeEach(async ({gunsmith}) => {
      await gunsmith.workshop.typeThePrompt("a fast little submachine gun");
      await gunsmith.workshop.make();
      const fast = await gunsmith.workshop.getResult();
      fastShotsASecond = Number.parseFloat(fast.stats["Shots a second"] ?? "");
      fastDamage = Number.parseFloat(fast.stats.Damage ?? "");
      fastPicture = fast.pictureAddress;
      fastRating = fast.rating;

      await gunsmith.workshop.pasteThePrompt("a long range sniper rifle");
      await gunsmith.workshop.make();
      const longRange = await gunsmith.workshop.getResult();
      longRangeShotsASecond = Number.parseFloat(longRange.stats["Shots a second"] ?? "");
      longRangeDamage = Number.parseFloat(longRange.stats.Damage ?? "");
      longRangePicture = longRange.pictureAddress;
      longRangeRating = longRange.rating;
    });

    then("each card shows the weapon asked for: the fast one fires more often, the long-range one hits harder", () => {
      expect(fastShotsASecond).toBeGreaterThan(longRangeShotsASecond);
      expect(longRangeDamage).toBeGreaterThan(fastDamage);
    });

    then("each card rates its own weapon: the two ratings differ", () => {
      expect(fastRating).not.toBe(longRangeRating);
    });

    then("each card has its own picture", () => {
      expect(fastPicture).not.toBe(longRangePicture);
    });
  });

  when("the player compares the power of a fast weapon and a long-range weapon", () => {
    let fastRating = 0;
    let fastMeterValue = 0;
    let fastTrackWidth = 0;
    let fastFillWidth = 0;

    beforeEach(async ({gunsmith}) => {
      await gunsmith.workshop.pasteThePrompt("a fast little submachine gun");
      await gunsmith.workshop.make();

      fastRating = (await gunsmith.workshop.getResult()).rating;
      const meter = await gunsmith.workshop.getPowerMeter();
      fastMeterValue = meter.value;
      fastTrackWidth = meter.trackWidth;
      fastFillWidth = meter.fillWidth;

      await gunsmith.workshop.pasteThePrompt("a long range sniper rifle");
      await gunsmith.workshop.make();
    });

    then("the meter fills to the printed power rating for each weapon", async ({gunsmith}) => {
      const {rating} = await gunsmith.workshop.getResult();
      const meter = await gunsmith.workshop.getPowerMeter();

      expect(rating).not.toBe(fastRating);
      expect(fastMeterValue).toBe(fastRating);
      expect(meter.value).toBe(rating);
      expect(meter.minimum).toBe(0);
      expect(meter.maximum).toBe(100);
      expect(fastTrackWidth).toBeGreaterThan(0);
      expect(meter.trackWidth).toBeGreaterThan(0);
      expect(Math.abs(fastFillWidth - (fastTrackWidth * fastRating) / 100)).toBeLessThanOrEqual(1);
      expect(Math.abs(meter.fillWidth - (meter.trackWidth * rating) / 100)).toBeLessThanOrEqual(1);
    });
  });

  when("the player has written nothing", () => {
    then("Make is off and no card is shown", async ({gunsmith}) => {
      expect(await gunsmith.workshop.canMake()).toBe(false);
      expect(await gunsmith.workshop.hasResult()).toBe(false);
    });
  });

  when("the player writes exactly as many characters as the limit allows", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.workshop.pasteThePrompt("a".repeat(WEAPON_PROMPT_LIMIT));
    });

    then("the count says so and Make is on", async ({gunsmith}) => {
      expect(await gunsmith.workshop.getPromptCount()).toEqual({
        length: WEAPON_PROMPT_LIMIT,
        limit: WEAPON_PROMPT_LIMIT,
        over: false,
      });
      expect(await gunsmith.workshop.canMake()).toBe(true);
    });
  });

  when("the player writes one character more than the limit allows", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.workshop.pasteThePrompt("a".repeat(WEAPON_PROMPT_LIMIT + 1));
    });

    then("the count says it is too long and Make is off", async ({gunsmith}) => {
      expect(await gunsmith.workshop.getPromptCount()).toEqual({
        length: WEAPON_PROMPT_LIMIT + 1,
        limit: WEAPON_PROMPT_LIMIT,
        over: true,
      });
      expect(await gunsmith.workshop.canMake()).toBe(false);
    });

    then("the text is kept, not cut", async ({gunsmith}) => {
      expect(await gunsmith.workshop.getPrompt()).toHaveLength(WEAPON_PROMPT_LIMIT + 1);
    });
  });

  when("the player makes a weapon, shuts the workshop and opens it again", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.workshop.typeThePrompt("a fast little submachine gun");
      await gunsmith.workshop.make();
      await gunsmith.workshop.close();
      await gunsmith.workshop.open();
    });

    then("the prompt and the card are as they were", async ({gunsmith}) => {
      expect(await gunsmith.workshop.getPrompt()).toBe("a fast little submachine gun");
      expect(await gunsmith.workshop.hasResult()).toBe(true);
    });
  });
});
