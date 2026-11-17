import fc from "fast-check";
import {UPHILLS} from "@gunsmith/engine/arena/types/Uphill";
import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import type {TileStair} from "@gunsmith/engine/arena/types/TileStair";

const LARGEST_SIDE = 7;
const HIGHEST_LEVEL = 3;

/**
 * Any arena at all that the types allow, with no regard for whether `arenaFrom` would draw it: from nothing at all (no
 * tiles) up to a handful on a side, each tile wall or floor, on any of a few levels, and a stair climbing any way. Stairs
 * are scattered anywhere, beside walls and drops, with no landings, which is what a model's output can be.
 */
export function anyArena(): fc.Arbitrary<Arena> {
  return fc.record({width: fc.nat(LARGEST_SIDE), height: fc.nat(LARGEST_SIDE)}).chain(({width, height}) => {
    const tiles = width * height;

    return fc.record({
      width: fc.constant(width),
      height: fc.constant(height),
      solid: fc.array(fc.boolean(), {minLength: tiles, maxLength: tiles}),
      levels: fc.array(fc.nat(HIGHEST_LEVEL), {minLength: tiles, maxLength: tiles}),
      stairs: fc.array(tileStair(), {minLength: tiles, maxLength: tiles}),
    });
  });
}

function tileStair(): fc.Arbitrary<TileStair> {
  return fc.option(fc.constantFrom(...UPHILLS), {nil: undefined});
}
