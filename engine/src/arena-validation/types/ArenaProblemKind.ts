/**
 * What is wrong with an arena: it has no floor at all, some of its floor cannot be walked to from the rest, there is nowhere
 * to start both fighters, or too little of it is floor.
 */
export type ArenaProblemKind = "noFloor" | "disconnected" | "noStartingPlaces" | "tooWalled";
