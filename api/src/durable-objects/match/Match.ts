import type {Seat} from "@gunsmith/engine/seat/types/Seat";
import {parseForfeitLimits} from "@src/durable-objects/match/forfeit-limits/ParseForfeitLimits";
import {parseInputMessage} from "@src/durable-objects/match/messages/ParseInputMessage";
import {parseReadyMessage} from "@src/durable-objects/match/messages/ParseReadyMessage";
import {MatchRoom} from "@src/durable-objects/match/room/MatchRoom";
import {MATCH_TICK} from "@src/durable-objects/match/tick/MatchTick";
import {stepsOwed} from "@src/durable-objects/match/tick/StepsOwed";

/** Nothing a player may send is as long as this: a longer frame is dropped unread. */
const LONGEST_FRAME = 1024;

/** The close code for "this room already has two players": a browser given it must not try again. */
const ROOM_FULL = 4409;

/** The close code for "this seat's person has connected again, from somewhere else": a browser given it must not try again, or two pages would take the seat from each other for ever. */
const REPLACED = 4410;

/** No token a browser shows is longer than this (a UUID is 36): a longer one is not a token. */
const LONGEST_TOKEN = 64;

/**
 * One private room's match, a Durable Object named by its friend code. This is the Workers runtime's edge and is kept to wiring
 * (it is not unit tested, as janggi's `ApiWorker`): it accepts the two WebSockets, hands each frame to `MatchRoom`, runs the
 * clock that steps it and sends each seat its own snapshot. What is decided is in `MatchRoom`. A browser that shows its seat's token
 * (`?token=`) is given that seat back, and the connection it had before, if the server still thinks it open, is closed; a seat whose
 * person has gone stands still until they come back, or until `MatchRoom`'s reconnect window or idle time runs out and the round is forfeited
 * (`docs/match-netcode.md`). The clock stops with the last connection, so a room everyone has left keeps its state but does not run down.
 */
export class Match {
  private room = new MatchRoom();
  private opened = false;
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

    this.openRoom(request);
    this.seat(server, this.tokenOf(request));

    return new Response(null, {status: 101, webSocket: client});
  }

  /**
   * The room's first connection sets how long it waits for a person (`?reconnectSeconds=`, `?idleSeconds=`, only ever shorter than the real
   * limits: `parseForfeitLimits`); later connections' say is ignored, so a seat's person cannot shorten the other's time.
   */
  private openRoom(request: Request): void {
    if (this.opened) {
      return;
    }

    this.opened = true;
    this.room = new MatchRoom(parseForfeitLimits(new URL(request.url).searchParams));
  }

  /** The token the browser shows (`?token=`), or `undefined` when it shows none or something too long to be one. */
  private tokenOf(request: Request): string | undefined {
    const token = new URL(request.url).searchParams.get("token");
    if (!token || token.length > LONGEST_TOKEN) {
      return undefined;
    }

    return token;
  }

  private seat(socket: WebSocket, token: string | undefined): void {
    const seat = this.takeSeat(token);
    if (!seat) {
      socket.close(ROOM_FULL, "room-full");

      return;
    }

    this.sockets.get(seat)?.close(REPLACED, "replaced");
    this.sockets.set(seat, socket);
    socket.send(JSON.stringify(this.room.joinedMessage(seat)));
    socket.addEventListener("message", event => {
      this.listen(seat, socket, event.data);
    });
    socket.addEventListener("close", () => {
      this.release(seat, socket);
    });
    this.startClock();
  }

  /** The seat `token` belongs to, else the next free one (a token that is not a seat's is an ordinary newcomer's). */
  private takeSeat(token: string | undefined): Seat | undefined {
    if (token) {
      const returning = this.room.reconnect(token);
      if (returning) {
        return returning;
      }
    }

    return this.room.join();
  }

  /** Hands a frame to the room, but only from the seat's current connection: one the seat has left behind, not yet closed, must not speak for it. */
  private listen(seat: Seat, socket: WebSocket, data: string | ArrayBuffer): void {
    if (this.sockets.get(seat) !== socket) {
      return;
    }
    if (typeof data !== "string" || data.length > LONGEST_FRAME) {
      return;
    }

    const message = parseInputMessage(data);
    if (message) {
      this.room.setInput(seat, message.input, message.seq);

      return;
    }

    if (parseReadyMessage(data)) {
      this.room.ready(seat);
    }
  }

  /** A connection has closed. Only the seat's current connection counts: the close of one that was replaced can arrive after its successor has the seat. */
  private release(seat: Seat, socket: WebSocket): void {
    if (this.sockets.get(seat) !== socket) {
      return;
    }

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
