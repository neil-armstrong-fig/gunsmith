/** The green channel at fixed landmarks in the terrain preview. */
export interface TerrainLook {
  floorFills: number[];
  /** Tick and gap samples for each floor, from lowest to highest. */
  floorMarks: number[][];
  joinAndWall: number[];
  stairBands: number[];
  stairTreads: number[];
  landingRails: number[];
  stairEntrances: number[];
  dropEdge: number[];
}
