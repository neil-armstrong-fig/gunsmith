/** A step to a neighbouring tile as the drawing counts it (columns to the east, rows to the south), and the arrow of a stair that climbs that way. */
export const CLIMBS = [
  {columns: 1, rows: 0, arrow: ">"},
  {columns: -1, rows: 0, arrow: "<"},
  {columns: 0, rows: -1, arrow: "^"},
  {columns: 0, rows: 1, arrow: "v"},
] as const;

export type Climb = (typeof CLIMBS)[number];
