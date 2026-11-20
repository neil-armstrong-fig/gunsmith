/**
 * What the server sends both browsers once, when the pre-round has decided the arena the match is played in: its layout, to swap in for
 * the one `joined` gave. Written out here as `api/` writes it, since nothing may import `api/`.
 */
export interface ArenaFrame {
  kind: "arena";
  rows: readonly string[];
}
