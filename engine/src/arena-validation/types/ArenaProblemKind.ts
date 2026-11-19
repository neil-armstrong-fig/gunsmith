/** What is wrong with an arena: it has no floor at all, some of its floor cannot be walked to from the rest, or too little of it is floor. */
export type ArenaProblemKind = "noFloor" | "disconnected" | "tooWalled";
