import fc from "fast-check";
import type {Arena} from "@gunsmith/engine/arena/types/Arena";

const LARGEST_SIDE = 8;

/** An arena of walls and low floor only, no stairs and no heights, from one tile to a handful on a side, so that "can be walked across" is plain four-way adjacency. */
export function flatArena(): fc.Arbitrary<Arena> {
  return fc
    .record({width: fc.integer({min: 1, max: LARGEST_SIDE}), height: fc.integer({min: 1, max: LARGEST_SIDE})})
    .chain(({width, height}) => {
      const tiles = width * height;

      return fc.record({
        width: fc.constant(width),
        height: fc.constant(height),
        solid: fc.array(fc.boolean(), {minLength: tiles, maxLength: tiles}),
        levels: fc.constant(new Array<number>(tiles).fill(0)),
        stairs: fc.constant(new Array<undefined>(tiles).fill(undefined)),
      });
    });
}
