import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import type {Input} from "@gunsmith/engine/game-loop/types/Input";
import type {World} from "@gunsmith/engine/game-loop/types/World";
import {worldOfSeatView} from "@gunsmith/engine/seat/WorldOfSeatView";
import {parseServerMessage} from "@src/online/messages/ParseServerMessage";
import type {MatchSocket} from "@src/online/types/MatchSocket";

/** `WebSocket.OPEN`: the only state a frame can be sent in. */
const SOCKET_OPEN = 1;

/**
 * This browser's end of an online match: it sends the player's input and keeps the latest world the server described. The
 * server steps the match; this only shows what it was told, so a fighter it did not send is simply not in the world, and
 * nothing is drawn for it. The loop takes each new world once (`takeWorld`) and sends one input a frame (`sendInput`).
 */
export class OnlineMatch {
  private arena: Arena | undefined;
  private unread: World | undefined;

  constructor(private readonly socket: MatchSocket) {
    socket.addEventListener("message", event => {
      this.receive(event.data);
    });
  }

  /** Sends what the player is asking for. Dropped while the socket is not open: the next frame carries the next ask. */
  sendInput(input: Input): void {
    if (this.socket.readyState !== SOCKET_OPEN) {
      return;
    }

    this.socket.send(JSON.stringify({kind: "input", ...input}));
  }

  /** The world of the newest snapshot the loop has not yet taken, or `undefined` when no new one has come. */
  takeWorld(): World | undefined {
    const world = this.unread;
    this.unread = undefined;

    return world;
  }

  close(): void {
    this.socket.close();
  }

  private receive(data: unknown): void {
    if (typeof data !== "string") {
      return;
    }

    const message = parseServerMessage(data);
    if (message?.kind === "joined") {
      this.arena = arenaFrom(message.arena);
    }
    if (message?.kind === "snapshot" && this.arena) {
      this.unread = worldOfSeatView(this.arena, message);
    }
  }
}
