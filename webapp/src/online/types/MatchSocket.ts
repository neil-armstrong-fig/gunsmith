import type {FrameEvent} from "@src/online/types/FrameEvent";

/** The part of a `WebSocket` an online match uses, so a test can stand a fake in its place. */
export interface MatchSocket {
  readyState: number;
  send(text: string): void;
  close(): void;
  addEventListener(type: "message", listener: (event: FrameEvent) => void): void;
}
