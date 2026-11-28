import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

const FAIR_DUEL_SIZE = {width: 21, height: 13};
const DUEL_SIZE = {width: 20, height: 12};
const PILLAR_YARD_SIZE = {width: 16, height: 8};
const RAISED_YARD_SIZE = {width: 14, height: 9};
const PILLAR_YARD_NAME = "Stand-in Pillar Yard";
const WINDOW_SIZES = [
  {width: 1024, height: 560},
  {width: 1280, height: 720},
  {width: 1440, height: 900},
];

given("the workshop is open on the practice range", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.workshop.open();
  });

  when("the player previews Fair duel", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.workshop.arenas.open("Fair duel");
    });

    then("the arena preview uses WebGL", async ({gunsmith}) => {
      await expect.poll(async () => await gunsmith.workshop.arenas.usesWebGl("Fair duel")).toBe(true);
    });

    then("the arena result draws the approved floor tick and wall brace", async ({gunsmith}) => {
      const colours = await gunsmith.workshop.arenas.getResultColours("Fair duel", FAIR_DUEL_SIZE, [
        {x: 2 + 8 / 64, y: 11 - 12 / 64},
        {x: 2.375, y: 11 - 12 / 64},
        {x: 9 / 64, y: 1 - 13 / 64},
        {x: 24 / 64, y: 1 - 13 / 64},
      ]);
      const [tick = 0, floor = 0, brace = 0, wall = 0] = colours.map(colour => colour.green);

      expect(tick).toBeGreaterThan(floor + 20);
      expect(brace).toBeGreaterThan(wall + 20);
    });

    then("both stairs rise towards the middle platform", async ({gunsmith}) => {
      const colours = await gunsmith.workshop.arenas.getResultColours("Fair duel", FAIR_DUEL_SIZE, [
        {x: 7.125, y: 6.5},
        {x: 7.875, y: 6.5},
        {x: 13.125, y: 6.5},
        {x: 13.875, y: 6.5},
      ]);
      const [westLow = 0, westHigh = 0, eastHigh = 0, eastLow = 0] = colours.map(colour => colour.green);

      expect(westHigh).toBeGreaterThan(westLow + 8);
      expect(eastHigh).toBeGreaterThan(eastLow + 8);
    });

    then("the result gives the arena dimensions, levels and labelled example starting places", async ({gunsmith}) => {
      const result = await gunsmith.workshop.arenas.getResultDescription();
      expect(result).toContain("21 × 13 tiles");
      expect(result).toContain("2 levels");
      expect(result).toContain("Example starting places");

      const colours = await gunsmith.workshop.arenas.getResultColours("Fair duel", FAIR_DUEL_SIZE, [
        {x: 10.5, y: 11.5},
        {x: 10.5, y: 1.5},
      ]);
      expect(colours.filter(({red, green, blue}) => red >= 220 && green >= 225 && blue >= 230)).toHaveLength(2);
    });
  });

  when.each(
    WINDOW_SIZES,
    size => `the player opens the Fair duel result in a ${size.width} × ${size.height} window`,
    size => {
      beforeEach(async ({gunsmith}) => {
        await gunsmith.browser.resizeWindowTo(size);
        await gunsmith.workshop.arenas.open("Fair duel");
      });

      then("the full result is visible as soon as the player selects it", async ({gunsmith}) => {
        await expect.poll(() => gunsmith.workshop.arenas.getVisibleResultFraction()).toBeGreaterThan(0.99);
      });
    },
  );

  when("the player compares the built-in arenas", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.workshop.arenas.open();
    });

    then("Fair duel shows a raised centre and Duel shows low ground", async ({gunsmith}) => {
      const centre = [{x: 10.5, y: 6.5}];
      const [fairDuel] = await gunsmith.workshop.arenas.getBuiltInColours("Fair duel", FAIR_DUEL_SIZE, centre);
      const [duel] = await gunsmith.workshop.arenas.getBuiltInColours("Duel", DUEL_SIZE, centre);

      expect(fairDuel?.green).toBe(64);
      expect(duel?.green).toBe(43);
    });
  });

  when("the player switches the result from Fair duel to Duel", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.browser.resizeWindowTo({width: 1440, height: 900});
      await gunsmith.workshop.arenas.open("Fair duel");
      await gunsmith.workshop.arenas.open("Duel");
    });

    then("the result fits Duel's terrain through the eastern wall", async ({gunsmith}) => {
      const colours = await gunsmith.workshop.arenas.getResultColours("Duel", DUEL_SIZE, [
        {x: 19 + 9 / 64, y: 12 - 13 / 64},
        {x: 19 + 24 / 64, y: 12 - 13 / 64},
        {x: 10.5, y: 6.5},
      ]);
      const [brace = 0, wall = 0, floor = 0] = colours.map(colour => colour.green);

      expect(brace).toBeGreaterThan(wall + 20);
      expect(floor).toBe(43);
    });
  });

  when("the player makes a pillar yard after previewing Fair duel", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.workshop.arenas.open("Fair duel");
      await gunsmith.workshop.pasteThePrompt("a yard with one pillar away from the centre");
      await gunsmith.workshop.make();
    });

    then("the arena result names the stand-in and draws the off-centre pillar", async ({gunsmith}) => {
      const result = await gunsmith.workshop.arenas.getResultDescription();
      expect(result).toContain(PILLAR_YARD_NAME);
      expect(result).toContain("16 × 8 tiles · 1 level");
      expect(result).not.toContain("Example starting places");

      const colours = await gunsmith.workshop.arenas.getResultColours(PILLAR_YARD_NAME, PILLAR_YARD_SIZE, [
        {x: 4 + 9 / 64, y: 5 - 13 / 64},
        {x: 4.5, y: 4.5},
        {x: 5.5, y: 4.5},
      ]);
      const [brace = 0, wall = 0, floor = 0] = colours.map(colour => colour.green);
      expect(brace).toBeGreaterThan(wall + 20);
      expect(floor).toBeGreaterThan(wall);
    });
  });

  when("the player makes a raised platform and reopens the workshop", () => {
    const prompt = "a raised platform with stairs";

    beforeEach(async ({gunsmith}) => {
      await gunsmith.browser.resizeWindowTo({width: 1024, height: 560});

      await gunsmith.workshop.arenas.open();
      await gunsmith.workshop.pasteThePrompt(prompt);
      await gunsmith.workshop.make();

      await gunsmith.workshop.close();
      await gunsmith.workshop.open();
    });

    then("the prompt and full result are still there, with the platform drawn above the floor", async ({gunsmith}) => {
      expect(await gunsmith.workshop.getPrompt()).toBe(prompt);
      expect(await gunsmith.workshop.arenas.getResultDescription()).toContain("14 × 9 tiles · 2 levels");
      await expect.poll(() => gunsmith.workshop.arenas.getVisibleResultFraction()).toBeGreaterThan(0.99);

      const [platform, ground] = await gunsmith.workshop.arenas.getResultColours(
        "Stand-in Raised Yard",
        RAISED_YARD_SIZE,
        [
          {x: 7.5, y: 4.5},
          {x: 10.5, y: 4.5},
        ],
      );
      expect(platform?.green).toBe(64);
      expect(ground?.green).toBe(43);
    });
  });

  when("the arena prompt is one character over its limit", () => {
    const prompt = "a".repeat(1001);

    beforeEach(async ({gunsmith}) => {
      await gunsmith.workshop.arenas.open();
      await gunsmith.workshop.pasteThePrompt(prompt);
    });

    then("the full prompt is kept and Make is disabled", async ({gunsmith}) => {
      expect(await gunsmith.workshop.getPromptCount()).toEqual({length: 1001, limit: 1000, over: true});
      expect(await gunsmith.workshop.getPrompt()).toBe(prompt);
      expect(await gunsmith.workshop.canMake()).toBe(false);
    });
  });
});
