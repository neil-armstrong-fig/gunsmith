/** Something on the screen that began to move by itself: a flash (an animation) or a bar sliding (a transition). */
export interface HudMotion {
  /** The `data-testid` of the element that moved. */
  testId: string;
  kind: "animation" | "transition";
  /** How long it was set to last, in seconds. */
  durationSeconds: number;
}
