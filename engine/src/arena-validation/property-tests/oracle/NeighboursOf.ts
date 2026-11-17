import type {Arena} from "@gunsmith/engine/arena/types/Arena";

/** The indexes of the tiles that touch the tile at `index` along an edge, wall or floor, the arena's own edge cutting off the ones beyond it. */
export function neighboursOf(arena: Arena, index: number): number[] {
  const x = index % arena.width;
  const y = Math.floor(index / arena.width);
  const neighbours: number[] = [];
  if (x > 0) {
    neighbours.push(index - 1);
  }

  if (x < arena.width - 1) {
    neighbours.push(index + 1);
  }

  if (y > 0) {
    neighbours.push(index - arena.width);
  }

  if (y < arena.height - 1) {
    neighbours.push(index + arena.width);
  }

  return neighbours;
}
