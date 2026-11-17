/**
 * An arena as it is written: a name and the drawing's rows, north first, the characters `arenaFrom` reads (`#` wall, `.` floor,
 * `1` and `2` raised floor, `^ v < >` stairs). DRAFT, local to `ai/`: the engine owns the `Arena` it becomes, and `shared/` has no
 * arena schema until a second package imports one.
 */
export interface ArenaDrawing {
  name: string;
  rows: readonly string[];
}
