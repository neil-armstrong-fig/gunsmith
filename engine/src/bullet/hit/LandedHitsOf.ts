import type {LandedHit} from "@gunsmith/engine/bullet/types/LandedHit";
import type {Meeting} from "@gunsmith/engine/bullet/types/Meeting";

/** One hit for each of the player's bullets that landed on the opponent or on a dummy, in the order of the meetings. */
export function landedHitsOf(meetings: readonly Meeting[]): LandedHit[] {
  const hits: LandedHit[] = [];

  for (const {bullet, contact, dummyIndex} of meetings) {
    if (bullet.shooter !== "player") {
      continue;
    }

    if (contact === "fighter") {
      hits.push({on: "opponent", dummyIndex: undefined});
    }

    if (contact === "dummy" && dummyIndex !== undefined) {
      hits.push({on: "dummy", dummyIndex});
    }
  }

  return hits;
}
