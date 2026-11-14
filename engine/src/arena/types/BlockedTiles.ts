/** Whether the tile at (`tileX`, `tileY`) stops whoever is looking or walking: a wall, or ground that is out of reach or out of sight from where they stand. */
export type BlockedTiles = (tileX: number, tileY: number) => boolean;
