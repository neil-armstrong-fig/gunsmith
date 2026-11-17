import type {Seat} from "@gunsmith/engine/seat/types/Seat";
import {parseInputMessage} from "@src/match/messages/ParseInputMessage";
import {MatchRoom} from "@src/match/room/MatchRoom";
import {MATCH_TICK} from "@src/match/tick/MatchTick";
import {stepsOwed} from "@src/match/tick/StepsOwed";

/** Nothing a player may send is as long as this: a longer frame is dropped unread. */
const LONGEST_FRAME = 1024;

/** The close code for "this room already has two players". */
const ROOM_FULL = 4409;

/**
 * One private room's match, a Durable Object named by its friend code. This is the Workers runtime's edge and is kept to wiring
 * (it is not unit tested, as janggi's `ApiWorker`): it accepts the two WebSockets, hands each frame to `MatchRoom`, runs the
 * clock that steps it and sends each seat its own snapshot. What is decided is in `MatchRoom`. A seat that disconnects is gone for
 * now: reconnect and idle forfeit come later (`docs/match-netcode.md`).
 */
export class Match {
  private readonly room = new MatchRoom();
  private readonly sockets = new Map<Seat, WebSocket>();
  private ticking: ReturnType<typeof setInterval> | undefined;
  private lastTickAt = 0;
  private leftoverSeconds = 0;

  async fetch(request: Request): Promise<Response> {
    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response("Expected a WebSocket upgrade", {status: 426});
    }

    const pair = new WebSocketPair();
    const [client, server] = [pair[0], pair[1]];
    server.accept();

    this.seat(server);

    return new Response(null, {status: 101, webSocket: client});
  }

  private seat(socket: WebSocket): void {
    const seat = this.room.join();
    if (!seat) {
      socket.close(ROOM_FULL, "room-full");

      return;
    }

    this.sockets.set(seat, socket);
    socket.send(JSON.stringify(this.room.joinedMessage(seat)));
    socket.addEventListener("message", event => {
      this.listen(seat, event.data);
    });
    socket.addEventListener("close", () => {
      this.release(seat);
    });
    this.startClock();
  }

  private listen(seat: Seat, data: string | ArrayBuffer): void {
    if (typeof data !== "string" || data.length > LONGEST_FRAME) {
      return;
    }

    const input = parseInputMessage(data);
    if (input) {
      this.room.setInput(seat, input);
    }
  }

  private release(seat: Seat): void {
    this.sockets.delete(seat);
    this.room.leave(seat);
    if (this.sockets.size === 0 && this.ticking !== undefined) {
      clearInterval(this.ticking);
      this.ticking = undefined;
    }
  }

  private startClock(): void {
    if (this.ticking !== undefined) {
      return;
    }

    this.lastTickAt = Date.now();
    this.ticking = setInterval(() => {
      const now = Date.now();
      const owed = stepsOwed(this.leftoverSeconds, (now - this.lastTickAt) / 1000);
      this.lastTickAt = now;
      this.leftoverSeconds = owed.leftoverSeconds;

      this.room.tick(owed.steps);
      this.sendSnapshots();
    }, MATCH_TICK.snapshotIntervalMilliseconds);
  }

  private sendSnapshots(): void {
    for (const [seat, socket] of this.sockets) {
      const snapshot = this.room.snapshotFor(seat);
      if (snapshot) {
        socket.send(JSON.stringify(snapshot));
      }
    }
  }
}
