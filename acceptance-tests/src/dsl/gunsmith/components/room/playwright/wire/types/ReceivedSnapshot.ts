/** What a browser was sent about the match in one `snapshot` frame, as far as a spec cares: whether the other seat's fighter was in it. */
export interface ReceivedSnapshot {
  /** The other seat's fighter. Absent when this seat cannot see it: the server must not send what a player cannot see. */
  opponent?: unknown;
}
