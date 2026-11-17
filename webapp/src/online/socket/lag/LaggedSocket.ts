import type {FrameEvent} from "@src/online/types/FrameEvent";
import type {MatchSocket} from "@src/online/types/MatchSocket";

/**
 * A socket that holds every frame up by `lagMilliseconds`, each way, and keeps them in order (the same hold-up for each frame, so a later
 * one never passes an earlier). It is how a page is made to feel a slower connection (`?lag=`); nothing about the match changes.
 */
export class LaggedSocket implements MatchSocket {
  constructor(
    private readonly socket: MatchSocket,
    private readonly lagMilliseconds: number,
  ) {}

  get readyState(): number {
    return this.socket.readyState;
  }

  send(text: string): void {
    setTimeout(() => {
      this.socket.send(text);
    }, this.lagMilliseconds);
  }

  close(): void {
    this.socket.close();
  }

  addEventListener(type: "message", listener: (event: FrameEvent) => void): void {
    this.socket.addEventListener(type, event => {
      setTimeout(() => {
        listener(event);
      }, this.lagMilliseconds);
    });
  }
}
