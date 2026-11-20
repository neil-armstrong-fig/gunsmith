/**
 * Where a search for the cheapest way has got to: the cheapest cost found so far to reach each tile (by its index in the drawing), the
 * tile each was reached from, and the tiles still to spread from, in one list for each cost (`open[2]` holds those reached at a cost of 2).
 */
export interface WaySearch {
  costs: Map<number, number>;
  before: Map<number, number>;
  open: number[][];
}
