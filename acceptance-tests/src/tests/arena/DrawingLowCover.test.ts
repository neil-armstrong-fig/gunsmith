import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

const WINDOWS = [
  {width: 1024, height: 560, pixelsPerTile: 64},
  {width: 512, height: 400, pixelsPerTile: 32},
];
const TILE_SIZE = 64;
const LANDMARKS = [
  {x: 32, y: 32}, // Top
  {x: 32, y: 12}, // North brace
  {x: 52, y: 32}, // East brace
  {x: 32, y: 52}, // South brace
  {x: 12, y: 32}, // West brace
  {x: 16, y: 12}, // Slate top beside each brace
  {x: 52, y: 16},
  {x: 48, y: 52},
  {x: 12, y: 48},
  {x: 8, y: 8}, // Square corners
  {x: 56, y: 8},
  {x: 56, y: 56},
  {x: 8, y: 56},
  {x: 4, y: 32}, // Floor margin
  {x: -60, y: 32}, // Matching open floor
].map(({x, y}) => ({x: 7 + x / TILE_SIZE, y: 4 - y / TILE_SIZE}));

given.each(
  WINDOWS,
  ({pixelsPerTile}) => `low cover at ${pixelsPerTile} pixels per tile`,
  ({width, height}) => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.resizeWindowTo({width, height});
      await gunsmith.startCover();
    });

    then("four matching braces frame the square block with floor showing around it", async ({gunsmith}) => {
      const colours = await gunsmith.arena.getTerrainColoursAt(LANDMARKS);

      expect(colours.map(({green}) => green)).toEqual([
        115, 152, 152, 152, 152, 115, 115, 115, 115, 67, 67, 67, 67, 43, 43,
      ]);
    });

    when("the player turns away", () => {
      beforeEach(async ({gunsmith}) => {
        await gunsmith.player.aimAtTile({x: 2.5, y: 3.5});
      });

      then("the fog dims the slab and floor while keeping the silhouette visible", async ({gunsmith}) => {
        await expect
          .poll(async () => {
            const colours = await gunsmith.arena.getTerrainColoursAt(LANDMARKS);

            return colours.map(({green}) => green);
          })
          .toEqual([58, 76, 76, 76, 76, 58, 58, 58, 58, 34, 34, 34, 34, 22, 22]);
      });
    });
  },
);
