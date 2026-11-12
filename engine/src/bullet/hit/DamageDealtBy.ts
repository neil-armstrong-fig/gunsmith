import type {Meeting} from "@gunsmith/engine/bullet/types/Meeting";
import type {Shooter} from "@gunsmith/engine/bullet/types/Shooter";

/** The damage of every bullet fired by `shooter` that landed on the fighter on the other side. */
export function damageDealtBy(meetings: readonly Meeting[], shooter: Shooter): number {
  return meetings
    .filter(meeting => meeting.contact === "fighter" && meeting.bullet.shooter === shooter)
    .reduce((total, meeting) => total + meeting.bullet.damage, 0);
}
