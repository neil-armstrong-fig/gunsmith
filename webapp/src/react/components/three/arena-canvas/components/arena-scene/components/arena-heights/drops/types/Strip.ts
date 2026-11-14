/** A rectangle in tiles from the raised tile's south-west corner; a shadow lies outside the tile, so its x or y can be below 0 or above 1. */
export interface Strip {
  x: number;
  y: number;
  width: number;
  height: number;
}
