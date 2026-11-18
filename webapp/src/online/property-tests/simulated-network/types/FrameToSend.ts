/** A frame about to go down a simulated line: which frame it is on that line, when it was sent, and how late each frame on the line is. */
export interface FrameToSend {
  text: string;
  sentAtStep: number;
  index: number;
  delays: readonly number[];
}
