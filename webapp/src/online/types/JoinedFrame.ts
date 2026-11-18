/**
 * What the server sends on every connection, as a browser takes its seat. Written out here as `api/` writes it: nothing may import
 * `api/`, and `shared/` cannot name the engine's types. The token is the secret that gets this seat back; it is optional here only
 * because an older server did not send one.
 */
export interface JoinedFrame {
  kind: "joined";
  seat: "first" | "second";
  arena: readonly string[];
  token?: string;
}
