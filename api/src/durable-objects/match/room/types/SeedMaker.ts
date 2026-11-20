/** Makes the seed a round's fair start is drawn from: a whole number, a different one each call unless a spec has pinned it. */
export type SeedMaker = () => number;
