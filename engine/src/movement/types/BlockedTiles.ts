/** Whether the tile at (`tileX`, `tileY`) stops whoever is walking: a wall, or ground they cannot step onto from where they stand. */
export type BlockedTiles = (tileX: number, tileY: number) => boolean;
