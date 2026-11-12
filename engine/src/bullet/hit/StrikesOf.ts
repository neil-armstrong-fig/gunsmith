import type {Meeting} from "@gunsmith/engine/bullet/types/Meeting";
import type {Strike} from "@gunsmith/engine/dummy/types/Strike";

/** One strike for each bullet that landed on a dummy: which dummy, and the damage that bullet does. */
export function strikesOf(meetings: readonly Meeting[]): Strike[] {
  const strikes: Strike[] = [];

  for (const {bullet, contact, dummyIndex} of meetings) {
    if (contact === "dummy" && dummyIndex !== undefined) {
      strikes.push({dummyIndex, damage: bullet.damage});
    }
  }

  return strikes;
}
