/**
 * An arena the game ships, as it is drawn: a name a player can pick it by and the drawing's rows, north first, in the characters
 * `arenaFrom` reads (`#` wall, `.` floor, `1` and `2` raised floor, `^ v < >` stairs).
 */
export interface BuiltInArena {
  name: string;
  rows: readonly string[];
}
