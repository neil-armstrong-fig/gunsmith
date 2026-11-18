import type {CloseEvent} from "@src/online/socket/reconnecting/types/CloseEvent";
import type {FrameEvent} from "@src/online/types/FrameEvent";

/** The part of a `WebSocket` a reconnecting socket opens and watches, so a test can stand a fake in its place. */
export interface RawSocket {
  readyState: number;
  send(text: string): void;
  close(): void;
  addEventListener(type: "message", listener: (event: FrameEvent) => void): void;
  addEventListener(type: "close", listener: (event: CloseEvent) => void): void;
}
