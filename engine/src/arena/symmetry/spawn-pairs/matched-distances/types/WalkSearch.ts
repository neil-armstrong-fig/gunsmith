import type {Arena} from "@gunsmith/engine/arena/types/Arena";

/** What the search for matched pairs works from: the arena, the tiles to stand on, how far each is from the middle, and the walk from any of them. Tiles are row-major indexes (`y * arena.width + x`). */
export interface WalkSearch {
  arena: Arena;
  /** The tiles a fighter may start on that can be walked to from the middle, lowest index first. */
  tiles: readonly number[];
  /** Those tiles grouped by level and steps from the middle (`bucketKey`), each group lowest index first. */
  buckets: ReadonlyMap<string, readonly number[]>;
  /** Steps on foot from the middle of the arena to each tile it can walk to. */
  stepsFromMiddle: ReadonlyMap<number, number>;
  /** Steps on foot from the tile at the index to each tile it can walk to; each tile is flooded once. */
  walkFrom: (index: number) => ReadonlyMap<number, number>;
  /** The fewest steps two fighters' places may be apart. */
  minimumSteps: number;
}
