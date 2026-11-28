import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {isCover} from "@gunsmith/engine/arena/IsCover";
import {isSolid} from "@gunsmith/engine/arena/IsSolid";
import {levelOfTile} from "@gunsmith/engine/arena/LevelOfTile";
import {stairOfTile} from "@gunsmith/engine/arena/StairOfTile";
import {transformArena} from "@gunsmith/engine/arena/symmetry/transform/TransformArena";

describe("with walls, levels and a stair", () => {
  // The stair is on tile (3, 2), climbing east to a platform on (4..5, 1..2).
  const WITH_STAIR = arenaFrom(["#######", "#..>11#", "#..#11#", "#######"]);

  it("moves a wall to the opposite corner when the arena is turned half way round", () => {
    const turned = transformArena(WITH_STAIR, "halfTurn");

    expect(isSolid(turned, 3, 1)).toBe(false);
    expect(isSolid(turned, 3, 2)).toBe(true);
    expect(isSolid(turned, 6, 3)).toBe(true);
  });

  it("carries a level with its tile when turned half way round", () => {
    const turned = transformArena(WITH_STAIR, "halfTurn");

    expect(levelOfTile(turned, 1, 1)).toBe(1);
    expect(levelOfTile(turned, 1, 2)).toBe(1);
    expect(levelOfTile(turned, 5, 1)).toBe(0);
  });

  it("moves a stair with its tile and makes it climb the other way when turned half way round", () => {
    const turned = transformArena(WITH_STAIR, "halfTurn");

    expect(stairOfTile(turned, 3, 1)).toBe("west");
    expect(stairOfTile(turned, 3, 2)).toBeUndefined();
  });

  it("reverses an east-climbing stair when mirrored east to west", () => {
    expect(stairOfTile(transformArena(WITH_STAIR, "mirrorEastWest"), 3, 2)).toBe("west");
  });

  it("keeps an east-climbing stair climbing east when mirrored north to south", () => {
    expect(stairOfTile(transformArena(WITH_STAIR, "mirrorNorthSouth"), 3, 1)).toBe("east");
  });

  it("reverses a north-climbing stair when mirrored north to south, and keeps it when mirrored east to west", () => {
    const climbingNorth = arenaFrom(["####", "#1##", "#^##", "#.##", "####"]);

    expect(stairOfTile(transformArena(climbingNorth, "mirrorNorthSouth"), 1, 2)).toBe("south");
    expect(stairOfTile(transformArena(climbingNorth, "mirrorEastWest"), 2, 2)).toBe("north");
  });

  it("is the arena itself when turned half way round twice", () => {
    expect(transformArena(transformArena(WITH_STAIR, "halfTurn"), "halfTurn")).toEqual(WITH_STAIR);
  });
});

describe("with a cover block", () => {
  // The cover block is on tile (1, 2).
  const WITH_COVER = arenaFrom(["######", "#c...#", "#....#", "######"]);

  it("carries a cover block with its tile, as a block and not as a wall, when turned half way round", () => {
    const turned = transformArena(WITH_COVER, "halfTurn");

    expect(isCover(turned, 4, 1)).toBe(true);
    expect(isSolid(turned, 4, 1)).toBe(true);
    expect(isCover(turned, 1, 2)).toBe(false);
    expect(isCover(turned, 0, 0)).toBe(false);
  });

  it("carries a cover block with its tile when mirrored east to west or north to south", () => {
    expect(isCover(transformArena(WITH_COVER, "mirrorEastWest"), 4, 2)).toBe(true);
    expect(isCover(transformArena(WITH_COVER, "mirrorNorthSouth"), 1, 1)).toBe(true);
  });
});
