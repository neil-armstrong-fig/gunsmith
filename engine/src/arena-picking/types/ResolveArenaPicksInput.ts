import type {ArenaPick} from "@gunsmith/engine/arena-picking/types/ArenaPick";

/** The two players' picks, in a fixed order, and the seed that chance settles them by. */
export interface ResolveArenaPicksInput {
  picks: readonly ArenaPick[];
  /** The engine's seeded generator state: the same seed and picks always give the same arena. */
  seed: number;
}
