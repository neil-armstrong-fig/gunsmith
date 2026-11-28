import type {Seat} from "@gunsmith/engine/seat/types/Seat";
import {countArenaPlay} from "@src/shared/accounts/count-arena-play/CountArenaPlay";
import {parseArenaRotation} from "@src/durable-objects/match/arena-rotation/ParseArenaRotation";
import {arenasOfToday} from "@src/durable-objects/match/arenas-of-today/ArenasOfToday";
import {resolveArenaChoice} from "@src/durable-objects/match/choices/ResolveArenaChoice";
import {resolveWeaponChoice} from "@src/durable-objects/match/choices/ResolveWeaponChoice";
import {parseForfeitLimits} from "@src/durable-objects/match/forfeit-limits/ParseForfeitLimits";
import {parseInputMessage} from "@src/durable-objects/match/messages/ParseInputMessage";
import {parsePreRoundMessage} from "@src/durable-objects/match/messages/ParsePreRoundMessage";
import type {PreRoundAction} from "@src/durable-objects/match/messages/types/PreRoundAction";
import {parseReadyMessage} from "@src/durable-objects/match/messages/ParseReadyMessage";
import {parseRevealSeconds} from "@src/durable-objects/match/reveal-seconds/ParseRevealSeconds";
import {parsePreRoundSeconds} from "@src/durable-objects/match/pre-round-seconds/ParsePreRoundSeconds";
import {parseRingTiming} from "@src/durable-objects/match/ring-timing/ParseRingTiming";
import {MatchRoom} from "@src/durable-objects/match/room/MatchRoom";
import {MATCH_TICK} from "@src/durable-objects/match/tick/MatchTick";
import {parseStartSeed} from "@src/durable-objects/match/start-seed/ParseStartSeed";
import {stepsOwed} from "@src/durable-objects/match/tick/StepsOwed";
import {utcDay} from "@src/durable-objects/shared/utc/UtcDay";
import {SEAT_ACCOUNT_HEADER} from "@src/shared/seat-account/SeatAccountHeader";

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
  /** The account each seat's person is signed in as (`SEAT_ACCOUNT_HEADER`), for the seats whose person is signed in. */
  private readonly accounts = new Map<Seat, string>();
  /** What each seat's pre-round frames have still to do, so they take effect in the order they were sent even when one waits on the database. */
  private readonly pending = new Map<Seat, Promise<void>>();
  /** Settles once the room has been told the day's arenas (or has failed to be, and offers every one); a seat's first pre-round frame waits for it. */
  private arenasOffered: Promise<void> = Promise.resolve();
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
    this.seat(server, this.tokenOf(request), request.headers.get(SEAT_ACCOUNT_HEADER) ?? undefined);

    return new Response(null, {status: 101, webSocket: client});
  }

  /**
   * The room's first connection sets how long it waits for a person (`?reconnectSeconds=`, `?idleSeconds=`, only ever shorter than the real
   * limits: `parseForfeitLimits`), how long the two seats have to choose (`?preRoundSeconds=`, `parsePreRoundSeconds`, `0` for none), how long the decided arena and weapons are shown before the match begins (`?revealSeconds=`, `parseRevealSeconds`, `0` for none) and may
   * pin the seed its rounds start from (`?startSeed=`, `parseStartSeed`, a spec's seam) and
   * may bring the ring sooner or faster and make it hurt more or less (`?ringDelay=`, `?ringClosing=`, `?ringDamage=`, `parseRingTiming`) and may offer every built-in arena instead
   * of the day's, counting no plays (`?arenaRotation=off`, `parseArenaRotation`, a spec's seam); later
   * connections' say is ignored, so a seat's person cannot shorten the other's time.
   */
  private openRoom(request: Request): void {
    if (this.opened) {
      return;
    }

    this.opened = true;
    const search = new URL(request.url).searchParams;
    const arenaRotation = parseArenaRotation(search);
    this.room = new MatchRoom({
      arenaRotation,
      limits: parseForfeitLimits(search),
      makeSeed: parseStartSeed(search),
      preRoundSeconds: parsePreRoundSeconds(search),
      revealSeconds: parseRevealSeconds(search),
      ringTiming: parseRingTiming(search),
    });

    if (arenaRotation) {
      this.arenasOffered = this.offerTheDaysArenas();
    }
  }

  /** Tells the room the built-in arenas it offers today. Should the plays not be read, it offers every one, and the failure is logged closed. */
  private async offerTheDaysArenas(): Promise<void> {
    try {
      this.room.offerArenas(await arenasOfToday(Date.now()));
    } catch {
      console.warn(JSON.stringify({event: "arenas-of-today-failed"}));
    }
  }

  /** Counts a match begun on a built-in arena towards the day's plays. A count that fails is logged closed; the match goes on. */
  private countArenaPlayed(): void {
    const played = this.room.takeArenaPlayed();
    if (!played) {
      return;
    }

    countArenaPlay(played, utcDay(Date.now())).catch(() => {
      console.warn(JSON.stringify({event: "arena-play-not-counted"}));
    });
  }

  /** The token the browser shows (`?token=`), or `undefined` when it shows none or something too long to be one. */
  private tokenOf(request: Request): string | undefined {
    const token = new URL(request.url).searchParams.get("token");
    if (!token || token.length > LONGEST_TOKEN) {
      return undefined;
    }

    return token;
  }

  private seat(socket: WebSocket, token: string | undefined, accountId: string | undefined): void {
    const seat = this.takeSeat(token);
    if (!seat) {
      socket.close(ROOM_FULL, "room-full");

      return;
    }

    this.sockets.get(seat)?.close(REPLACED, "replaced");
    this.sockets.set(seat, socket);
    this.rememberAccount(seat, accountId);
    socket.send(JSON.stringify(this.room.joinedMessage(seat)));
    socket.addEventListener("message", event => {
      this.listen(seat, socket, event.data);
    });
    socket.addEventListener("close", () => {
      this.release(seat, socket);
    });
    this.startClock();
  }

  /** The seat's person is signed in as `accountId`, or is a guest: what the latest connection says replaces what an earlier one did. */
  private rememberAccount(seat: Seat, accountId: string | undefined): void {
    if (accountId) {
      this.accounts.set(seat, accountId);

      return;
    }

    this.accounts.delete(seat);
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

      return;
    }

    const action = parsePreRoundMessage(data);
    if (action) {
      this.afterEarlierFrames(seat, () => this.takePreRoundAction(seat, socket, action));
    }
  }

  /**
   * Runs `work` once the seat's earlier pre-round frames have finished, so a lock-in never overtakes the choice sent before it, and the
   * first of them once the room knows the day's arenas. A failure is logged closed and does not stop the frames after it.
   */
  private afterEarlierFrames(seat: Seat, work: () => Promise<void>): void {
    const earlier = this.pending.get(seat) ?? this.arenasOffered;
    this.pending.set(
      seat,
      earlier.then(work).catch(() => {
        console.warn(JSON.stringify({event: "pre-round-frame-failed"}));
      }),
    );
  }

  /** What a seat's pre-round frame does: a choice is looked up first (a saved id is the account's own or nothing), anything else the room does at once. Nothing is done for a seat whose connection has moved on meanwhile. */
  private async takePreRoundAction(seat: Seat, socket: WebSocket, action: PreRoundAction): Promise<void> {
    if (action.kind === "chooseArena") {
      const chosen = await resolveArenaChoice(this.accounts.get(seat), action.choice);
      if (chosen && this.sockets.get(seat) === socket) {
        this.room.chooseArena(seat, chosen);
      }

      return;
    }
    if (action.kind === "chooseWeapon") {
      const chosen = await resolveWeaponChoice(this.accounts.get(seat), action.choice);
      if (chosen && this.sockets.get(seat) === socket) {
        this.room.chooseWeapon(seat, action.slot, chosen);
      }

      return;
    }
    if (this.sockets.get(seat) === socket) {
      this.room.preRoundAction(seat, action);
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

  /** Tells each connection what its seat may know: the arena and the reveal once, when the match begins, the other seat's saved weapons once as they are shown, then the choosing while there is some, else its snapshot. */
  private sendSnapshots(): void {
    this.countArenaPlayed();
    for (const [seat, socket] of this.sockets) {
      const arena = this.room.takeArenaMessage(seat);
      if (arena) {
        socket.send(JSON.stringify(arena));
      }

      const reveal = this.room.takeRevealMessage(seat);
      if (reveal) {
        socket.send(JSON.stringify(reveal));
      }

      for (const opponentWeaponMessage of this.room.takeOpponentWeaponMessages(seat)) {
        socket.send(JSON.stringify(opponentWeaponMessage));
      }

      const frame = this.room.snapshotFor(seat) ?? this.room.preRoundFor(seat);
      if (frame) {
        socket.send(JSON.stringify(frame));
      }
    }
  }
}
