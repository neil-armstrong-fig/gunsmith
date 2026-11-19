import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

const FAIR_DUEL_SIZE = {width: 21, height: 13};
const DUEL_SIZE = {width: 20, height: 12};

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

  when("the player opens the Fair duel result in a 1280 × 720 window", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.resizeWindowTo({width: 1280, height: 720});
      await gunsmith.workshop.arenas.open("Fair duel");
    });

    then("the full result is visible as soon as the player selects it", async ({gunsmith}) => {
      await expect.poll(() => gunsmith.workshop.arenas.getVisibleResultFraction()).toBeGreaterThan(0.99);
    });
  });

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
});
