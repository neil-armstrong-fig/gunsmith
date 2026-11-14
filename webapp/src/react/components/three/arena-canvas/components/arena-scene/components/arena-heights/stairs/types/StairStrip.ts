/** One band of a stair's flight, in tiles from the tile's south-west corner, and how far up the flight it is (0 the low end, 1 the high). */
export interface StairStrip {
  x: number;
  y: number;
  width: number;
  height: number;
  fraction: number;
}
