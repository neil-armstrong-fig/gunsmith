import {characterAt} from "@gunsmith/engine/arena-repair/drawing/CharacterAt";
import type {WayRequest} from "@gunsmith/engine/arena-repair/doors/cheapest-way/types/WayRequest";
import type {WaySearch} from "@gunsmith/engine/arena-repair/doors/cheapest-way/types/WaySearch";
import type {DrawnTile} from "@gunsmith/engine/arena-repair/types/DrawnTile";

/**
 * What it costs to cut through a tile: none for floor on the low ground, one for a wall or a cover block. Raised floor, a stair
 * and anything not in this table cannot be cut through: a platform is something the model drew on purpose, not a wall in the way.
 */
const COST_OF_CHARACTER: Readonly<Record<string, number>> = {".": 0, "#": 1, c: 1};

/** The four ways to step, in the order they are tried, so that a tie is always broken the same way. */
const STEPS = [
  {columns: 1, rows: 0},
  {columns: -1, rows: 0},
  {columns: 0, rows: 1},
  {columns: 0, rows: -1},
] as const;

/**
 * The cheapest way from one piece of floor to another across the drawing, as the tiles walked from the first tile it leaves to
 * the first it reaches, or `undefined` when there is none. The border of the drawing is never crossed. The costs are 0 and
 * 1, so the search keeps its open tiles in one list per cost instead of sorting them.
 */
export function cheapestWay(rows: readonly string[], request: WayRequest): DrawnTile[] | undefined {
  const width = rows[0]?.length ?? 0;
  const goals = new Set(request.to.map(tile => indexOf(tile, width)));
  const search = startSearch(request.from, width);

  for (let cost = 0; cost < search.open.length; cost += 1) {
    // The list for this cost can grow while it is read, because stepping onto floor adds nothing to the cost. A tile may be listed again at a
    // lower cost than an earlier listing; spreading from it twice changes nothing, since a neighbour is only kept when it is reached more cheaply.
    for (const index of search.open[cost] ?? []) {
      if (goals.has(index)) {
        return wayTo(index, search.before, width);
      }

      spreadFrom(rows, search, index);
    }
  }

  return undefined;
}

/** A search that has only begun: every tile the way may leave is reached, at no cost. */
function startSearch(from: readonly DrawnTile[], width: number): WaySearch {
  const reachedFirst: number[] = [];
  const search: WaySearch = {costs: new Map(), before: new Map(), open: [reachedFirst]};

  for (const tile of from) {
    const index = indexOf(tile, width);
    search.costs.set(index, 0);
    reachedFirst.push(index);
  }

  return search;
}

/** Steps from one reached tile to each neighbour it can cross, and keeps every neighbour this way reaches more cheaply than any before. */
function spreadFrom(rows: readonly string[], search: WaySearch, index: number): void {
  const width = rows[0]?.length ?? 0;
  const cost = search.costs.get(index) ?? 0;

  for (const step of STEPS) {
    const next = {column: (index % width) + step.columns, row: Math.floor(index / width) + step.rows};
    const toCross = costOfTile(rows, next);
    if (toCross === undefined) {
      continue;
    }

    const nextIndex = indexOf(next, width);
    const total = cost + toCross;
    if (total >= (search.costs.get(nextIndex) ?? Infinity)) {
      continue;
    }

    search.costs.set(nextIndex, total);
    search.before.set(nextIndex, index);
    (search.open[total] ??= []).push(nextIndex);
  }
}

function indexOf(tile: DrawnTile, width: number): number {
  return tile.row * width + tile.column;
}

/** What it costs to step onto a tile, or `undefined` when the step is not allowed: onto the border, off the drawing, or onto anything that cannot be cut through (raised floor, a stair). */
function costOfTile(rows: readonly string[], tile: DrawnTile): number | undefined {
  const width = rows[0]?.length ?? 0;
  const height = rows.length;
  const onBorder = tile.column < 1 || tile.row < 1 || tile.column > width - 2 || tile.row > height - 2;
  if (onBorder) {
    return undefined;
  }

  const character = characterAt(rows, tile);
  if (character === undefined || !Object.hasOwn(COST_OF_CHARACTER, character)) {
    return undefined;
  }

  return COST_OF_CHARACTER[character];
}

function wayTo(end: number, before: ReadonlyMap<number, number>, width: number): DrawnTile[] {
  const way: DrawnTile[] = [];

  for (let index: number | undefined = end; index !== undefined; index = before.get(index)) {
    way.push({column: index % width, row: Math.floor(index / width)});
  }

  return way.reverse();
}
