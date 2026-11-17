import type {FrameEvent} from "@src/online/types/FrameEvent";
import type {MatchSocket} from "@src/online/types/MatchSocket";

/** A socket with no network: what the browser sends is kept for the simulation to carry, and what the simulation hands over is what the browser receives. */
export class LoopbackSocket implements MatchSocket {
  readyState = 1;
  private sent: string[] = [];
  private listener: ((event: FrameEvent) => void) | undefined;

  send(text: string): void {
    this.sent.push(text);
  }

  close(): void {
    this.readyState = 3;
  }

  addEventListener(_type: "message", listener: (event: FrameEvent) => void): void {
    this.listener = listener;
  }

  /** What the browser has sent since this was last asked, in order. */
  takeSent(): string[] {
    const frames = this.sent;
    this.sent = [];

    return frames;
  }

  /** Hands the browser a frame as if it had just arrived. */
  deliver(data: unknown): void {
    this.listener?.({data});
  }
}
