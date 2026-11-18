import type {Point} from "@src/dsl/gunsmith/types/Point";

/** What a browser was sent about the match in one `snapshot` frame, as far as a spec cares: where its own fighter was, and whether the other seat's fighter was in it. */
export interface ReceivedSnapshot {
  /** The other seat's fighter. Absent when this seat cannot see it: the server must not send what a player cannot see. */
  opponent?: unknown;
  /** Where the server said this seat's own fighter was. Absent when the frame carries no position. */
  position?: Point;
  /** The server's game time when it wrote the frame, in seconds. Absent when the frame carries none. */
  elapsedSeconds?: number;
}
