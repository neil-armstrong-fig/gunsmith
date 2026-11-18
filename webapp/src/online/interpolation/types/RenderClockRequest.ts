/** What the render clock is asked each frame: this browser's own clock now, and the server's game time of the newest snapshot, both in seconds. */
export interface RenderClockRequest {
  now: number;
  newestElapsedSeconds: number;
}
