/** One stair tile, and the way it climbs. */
export interface ShapeStair {
  x: number;
  y: number;
  direction: "north" | "south" | "west" | "east";
}
