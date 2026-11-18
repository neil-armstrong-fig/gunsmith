import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

const WINDOWS = [
  {width: 1024, height: 560, pixelsPerTile: 64},
  {width: 512, height: 400, pixelsPerTile: 32},
];
const FLOOR_GREEN = [43, 64, 90];
const FLOOR_TICKS = [
  [true, false, false, false, false, false],
  [true, false, true, false, false, false],
  [true, false, true, false, true, false],
];

given.each(
  WINDOWS,
  ({pixelsPerTile}) => `a terrain preview at ${pixelsPerTile} pixels per tile`,
  ({width, height, pixelsPerTile}) => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.resizeWindowTo({width, height});
      await gunsmith.startTerrain();
    });

    then("the three floors have their own colours and one, two and three screen-up ticks", async ({gunsmith}) => {
      const {floorFills, floorMarks} = await gunsmith.arena.getTerrainLook(pixelsPerTile);

      expect(floorFills).toEqual(FLOOR_GREEN);
      expect(floorMarks.map(marks => marks.map(green => green > 105))).toEqual(FLOOR_TICKS);
    });

    then("adjacent floor cells meet at a repeating seam and the solid wall has corner braces", async ({gunsmith}) => {
      const {joinAndWall} = await gunsmith.arena.getTerrainLook(pixelsPerTile);
      const [floor, seam, nextFloor, wall, brace] = joinAndWall;

      expect(floor).toBe(FLOOR_GREEN[0]);
      expect(nextFloor).toBe(floor);
      expect(seam).toBeGreaterThan(floor ?? 0);
      expect(wall).toBeLessThan(floor ?? 0);
      expect(brace).toBeGreaterThan((wall ?? 0) + 25);
    });

    then("the stair bands climb in brightness and the drop still has a bright lip and a shadow", async ({gunsmith}) => {
      const {stairBands, dropEdge} = await gunsmith.arena.getTerrainLook(pixelsPerTile);
      const [shadow, lip, highFloor] = dropEdge;

      expect(stairBands).toEqual([...new Set(stairBands)].sort((a, b) => a - b));
      expect(shadow).toBeLessThan(FLOOR_GREEN[1] ?? 0);
      expect(lip).toBeGreaterThan(highFloor ?? 0);
    });

    when("the player turns away from the stairs", () => {
      beforeEach(async ({gunsmith}) => {
        await gunsmith.player.aimAtTile({x: 13.5, y: 3.5});
      });

      then("the fog dims both the floor and its markings while keeping them visible", async ({gunsmith}) => {
        await expect
          .poll(async () => {
            const {floorFills, floorMarks} = await gunsmith.arena.getTerrainLook(pixelsPerTile);
            const floor = floorFills[2];
            const tick = floorMarks[2]?.[0];
            return (floor ?? 0) > 8 && (floor ?? 100) < 85 && (tick ?? 0) > (floor ?? 100) + 12;
          })
          .toBe(true);
      });
    });
  },
);

given("the highest terrain picture is held back", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.resizeWindowTo({width: 1024, height: 560});
    await gunsmith.startTerrain("held");
  });

  then("the arena shows a flat upper floor and is still waiting for pictures", async ({gunsmith}) => {
    expect(await gunsmith.arena.isWaitingForPictures()).toBe(true);

    const {floorFills, floorMarks} = await gunsmith.arena.getTerrainLook(64);
    expect(floorMarks[2]?.[0]).toBe(floorFills[2]);
  });

  when("the picture arrives", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.releasePictures();
    });

    then("the highest floor shows its three ticks", async ({gunsmith}) => {
      await expect
        .poll(async () => {
          const {floorMarks} = await gunsmith.arena.getTerrainLook(64);
          return floorMarks[2]?.map(green => green > 105);
        })
        .toEqual(FLOOR_TICKS[2]);
    });
  });
});

given("the highest terrain picture is missing", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.resizeWindowTo({width: 1024, height: 560});
    await gunsmith.startTerrain("missing");
  });

  then(
    "the arena becomes ready with a flat upper floor and the other floors still show their pictures",
    async ({gunsmith}) => {
      const {floorFills, floorMarks} = await gunsmith.arena.getTerrainLook(64);

      expect(floorMarks[2]?.[0]).toBe(floorFills[2]);
      expect(floorFills[2]).toBe(FLOOR_GREEN[2]);
      expect(floorMarks[1]?.[0]).toBeGreaterThan(105);
    },
  );
});
