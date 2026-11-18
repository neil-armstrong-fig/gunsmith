import type {CloseEvent} from "@src/online/socket/reconnecting/types/CloseEvent";
import type {RawSocket} from "@src/online/socket/reconnecting/types/RawSocket";
import type {FrameEvent} from "@src/online/types/FrameEvent";
import type {MatchSocket} from "@src/online/types/MatchSocket";

/** `WebSocket.CONNECTING`, `OPEN` and `CLOSED`. */
const CONNECTING = 0;
const OPEN = 1;
const CLOSED = 3;

/** The close codes that mean "do not come back": the room is full, or the seat's person connected again from another page (`api/src/match/Match.ts`). */
const FINAL_CLOSE_CODES: readonly number[] = [4409, 4410];

/** The wait before the first try again, doubled after each try that fails, up to the longest. Tunables. */
const FIRST_WAIT_MILLISECONDS = 250;
const LONGEST_WAIT_MILLISECONDS = 4000;

/**
 * A socket that opens its connection again when it is lost, so a dropped network or a restarted server does not end the match for this
 * browser: the server keeps the seat for its token (`SeatTokenKeeper`), which the next connection shows. Frames go to the same listeners
 * whichever connection they come on. While there is no connection it reports itself connecting and sends nothing (the match sends what
 * it still wants on its next step). It gives up for good when the server's close code says it must not come back, or when it is closed
 * on purpose.
 */
export class ReconnectingSocket implements MatchSocket {
  private current: RawSocket | undefined;
  private finished = false;
  private tries = 0;
  private waiting: ReturnType<typeof setTimeout> | undefined;
  private readonly listeners: ((event: FrameEvent) => void)[] = [];

  /** `open` makes a connection each time it is called: the address it uses may change between calls (it carries the token). */
  constructor(private readonly open: () => RawSocket) {
    this.connect();
  }

  get readyState(): number {
    if (this.finished) {
      return CLOSED;
    }
    if (!this.current) {
      return CONNECTING;
    }

    return this.current.readyState;
  }

  send(text: string): void {
    if (this.current?.readyState === OPEN) {
      this.current.send(text);
    }
  }

  close(): void {
    this.finished = true;
    clearTimeout(this.waiting);
    this.current?.close();
  }

  addEventListener(_type: "message", listener: (event: FrameEvent) => void): void {
    this.listeners.push(listener);
  }

  private connect(): void {
    const socket = this.open();
    this.current = socket;
    socket.addEventListener("message", event => {
      this.tries = 0;
      for (const listener of this.listeners) {
        listener(event);
      }
    });
    socket.addEventListener("close", (event: CloseEvent) => {
      this.lost(socket, event.code);
    });
  }

  private lost(socket: RawSocket, code: number): void {
    if (this.current !== socket) {
      return;
    }

    this.current = undefined;
    if (this.finished || FINAL_CLOSE_CODES.includes(code)) {
      this.finished = true;

      return;
    }

    const wait = Math.min(FIRST_WAIT_MILLISECONDS * 2 ** this.tries, LONGEST_WAIT_MILLISECONDS);
    this.tries += 1;
    this.waiting = setTimeout(() => {
      this.connect();
    }, wait);
  }
}
