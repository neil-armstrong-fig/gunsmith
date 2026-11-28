import {isCover} from "@gunsmith/engine/arena/IsCover";
import {coverWorld} from "@src/game/scenario/round/world-of-scenario/setups/cover/CoverWorld";

it("starts the player on the low ground at (3.5, 3.5), facing east, with no opponent, ring or weapon lying about", () => {
  const world = coverWorld();

  expect(world.player.position).toEqual({x: 3.5, y: 3.5});
  expect(world.player.aim).toEqual({x: 1, y: 0});
  expect(world.player.crouching).toBe(false);
  expect(world.opponent).toBeUndefined();
  expect(world.ring).toBeUndefined();
  expect(world.pickup).toBeUndefined();
});

it("draws a cover block at (7, 3) and another at (7, 1), and no other", () => {
  const {arena} = coverWorld();
  const blocks: string[] = [];

  for (let y = 0; y < arena.height; y += 1) {
    for (let x = 0; x < arena.width; x += 1) {
      if (isCover(arena, x, y)) {
        blocks.push(`${x},${y}`);
      }
    }
  }

  expect(blocks.sort()).toEqual(["7,1", "7,3"]);
});

it("stands a dummy at (8.5, 3.5), another at (8.5, 1.5) and a third at (8.5, 5.5), in the order the specs name them", () => {
  expect(coverWorld().dummies.map(dummy => dummy.position)).toEqual([
    {x: 8.5, y: 3.5},
    {x: 8.5, y: 1.5},
    {x: 8.5, y: 5.5},
  ]);
});

it("has the first dummy standing behind its block, the second crouched behind its block and the third crouched in the open", () => {
  expect(coverWorld().dummies.map(dummy => dummy.crouching)).toEqual([false, true, true]);
});

it("leaves every dummy at full health", () => {
  const healths = coverWorld().dummies.map(dummy => dummy.health);

  expect(new Set(healths).size).toBe(1);
  expect(healths[0]).toBeGreaterThan(0);
});
