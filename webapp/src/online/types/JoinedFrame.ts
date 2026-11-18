/**
 * What the server sends once, as a browser takes a seat. Written out here as `api/` writes it: nothing may import `api/`, and
 * `shared/` cannot name the engine's types.
 */
export interface JoinedFrame {
  kind: "joined";
  seat: "first" | "second";
  arena: readonly string[];
}
