import {beforeEach, expect, given, then} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

const DESIGN_PIXELS_PER_TILE = 64;
const STAIR_MARK_GREEN = 162;
const DIM_STAIR_MARK_GREEN = 81;
const RAIL_OFFSETS = [1 - 4 / DESIGN_PIXELS_PER_TILE, 1 - 58 / DESIGN_PIXELS_PER_TILE];
const LANDING_INSET = 10 / DESIGN_PIXELS_PER_TILE;
const FAIR_LANDINGS = [7 - LANDING_INSET, 8 + LANDING_INSET, 13 - LANDING_INSET, 14 + LANDING_INSET];
const TERRACED_LANDINGS = [10 - LANDING_INSET, 11 + LANDING_INSET];

given.each(
  [64, 32],
  pixelsPerTile => `a fair duel at ${pixelsPerTile} pixels per tile with the stairs behind the player`,
  pixelsPerTile => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.resizeWindowTo({width: 21 * pixelsPerTile, height: 13 * pixelsPerTile});
      gunsmith.keepTheCameraStill();
      await gunsmith.startFairDuel(17);
      await gunsmith.holdTheGame();
      await gunsmith.player.aimAtTile({x: 10.5, y: 12.5});
      await gunsmith.runGameFor(0.05);
      expect(await gunsmith.player.getAimDegrees()).toBeCloseTo(90, 0);
    });

    then("the treads turn with the two opposing stairs and remain visible under fog", async ({gunsmith}) => {
      const eastTreads = [16, 32, 48].map(x => ({x: 7 + x / DESIGN_PIXELS_PER_TILE, y: 6.5}));
      const westTreads = [46, 30, 14].map(x => ({x: 13 + x / DESIGN_PIXELS_PER_TILE, y: 6.5}));
      const colours = await gunsmith.arena.getTerrainColoursAt([...eastTreads, ...westTreads]);

      expect(colours.map(({green}) => green)).toEqual(Array(6).fill(DIM_STAIR_MARK_GREEN));
    });

    then("rails frame both landings of each stair with a clear entrance between them", async ({gunsmith}) => {
      const rails = FAIR_LANDINGS.flatMap(x => RAIL_OFFSETS.map(offset => ({x, y: 6 + offset})));
      const entrances = FAIR_LANDINGS.map(x => ({x, y: 6.5}));
      const colours = await gunsmith.arena.getTerrainColoursAt([...rails, ...entrances]);

      expect(colours.slice(0, rails.length).map(({green}) => green)).toEqual(Array(8).fill(DIM_STAIR_MARK_GREEN));
      expect(colours.slice(rails.length).map(({green}) => green)).toEqual([22, 32, 32, 22]);
    });
  },
);

given.each(
  [64, 32],
  pixelsPerTile => `a terraced duel at ${pixelsPerTile} pixels per tile facing the wall-side stair`,
  pixelsPerTile => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.resizeWindowTo({width: 25 * pixelsPerTile, height: Math.max(7 * pixelsPerTile, 384)});
      gunsmith.keepTheCameraStill();
      // The player starts back from the platform's edge, from where the edge rule hides the low ground; these criteria are about the
      // pictures, so the fog's veil is left out.
      gunsmith.hideTheFog();
      await gunsmith.startTerracedDuel({seed: 9, delaySeconds: 60, closingSeconds: 60});
      await gunsmith.holdTheGame();
      await gunsmith.player.aimAtTile({x: 10.5, y: 5.5});
      await gunsmith.runGameFor(0.05);
      expect(await gunsmith.player.getAimDegrees()).toBeCloseTo(135, 0);
    });

    then("the rails mark both open landings and stop clear of the wall", async ({gunsmith}) => {
      const rails = TERRACED_LANDINGS.flatMap(x => RAIL_OFFSETS.map(offset => ({x, y: 5 + offset})));
      const entrances = TERRACED_LANDINGS.map(x => ({x, y: 5.5}));
      const northWall = TERRACED_LANDINGS.map(x => ({x, y: 6 + 4 / DESIGN_PIXELS_PER_TILE}));
      const colours = await gunsmith.arena.getTerrainColoursAt([...rails, ...entrances, ...northWall]);
      const greens = colours.map(({green}) => green);

      const railGreens = greens.slice(0, rails.length);
      // Allow two green levels for rasterisation at the 32 px scale.
      expect(Math.min(...railGreens)).toBeGreaterThanOrEqual(STAIR_MARK_GREEN - 2);
      expect(Math.max(...railGreens)).toBeLessThanOrEqual(STAIR_MARK_GREEN + 2);
      expect(greens.slice(rails.length, rails.length + entrances.length)).toEqual([43, 64]);
      // No rail's green on the wall. With the fog hidden the wall is lit, and at 32 px the rail's edge blends into its first pixels.
      expect(Math.max(...greens.slice(-northWall.length))).toBeLessThan(STAIR_MARK_GREEN - 30);
    });

    then("the nearby drop has a narrow slate lip and a short shadow", async ({gunsmith}) => {
      const colours = await gunsmith.arena.getTerrainColoursAt([
        {x: 10.75, y: 4.5},
        {x: 10.9, y: 4.5},
        {x: 11 + 2 / DESIGN_PIXELS_PER_TILE, y: 4.5},
        {x: 11 + 4 / DESIGN_PIXELS_PER_TILE, y: 4.5},
      ]);
      const [lowFloor, shadow, lip, highFloor] = colours.map(({green}) => green);

      expect(lowFloor).toBe(43);
      expect(shadow).toBeLessThan(43);
      expect(lip).toBe(STAIR_MARK_GREEN);
      expect(highFloor).toBe(64);
    });
  },
);
