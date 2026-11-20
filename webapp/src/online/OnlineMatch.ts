import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import type {Input} from "@gunsmith/engine/game-loop/types/Input";
import type {World} from "@gunsmith/engine/game-loop/types/World";
import type {Point} from "@gunsmith/engine/geometry/types/Point";
import type {Player} from "@gunsmith/engine/player/types/Player";
import {worldOfSeatView} from "@gunsmith/engine/seat/WorldOfSeatView";
import {opponentAt} from "@src/online/interpolation/OpponentAt";
import {RenderClock} from "@src/online/interpolation/RenderClock";
import {SnapshotBuffer} from "@src/online/interpolation/SnapshotBuffer";
import {parseServerMessage} from "@src/online/messages/ParseServerMessage";
import {inputChanged} from "@src/online/prediction/changes/InputChanged";
import {correctionOffset} from "@src/online/prediction/correction/CorrectionOffset";
import {fadedOffset} from "@src/online/prediction/correction/FadedOffset";
import {InputHistory} from "@src/online/prediction/history/InputHistory";
import {replayInputs} from "@src/online/prediction/replay/ReplayInputs";
import type {InputAck} from "@gunsmith/shared/online/types/InputAck";
import type {SeatTokenKeeper} from "@src/online/seat-token/SeatTokenKeeper";
import type {JoinedFrame} from "@src/online/types/JoinedFrame";
import type {MatchSocket} from "@src/online/types/MatchSocket";
import type {PreRoundFrame} from "@src/online/types/pre-round/PreRoundFrame";
import type {Readiness} from "@src/online/types/Readiness";
import type {SeatPick} from "@src/online/types/pre-round/SeatPick";
import type {WeaponKeys} from "@src/online/types/pre-round/WeaponKeys";
import type {SnapshotFrame} from "@src/online/types/SnapshotFrame";
import {TICK_SECONDS} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-game-loop/clock/TickSeconds";

/** `WebSocket.CONNECTING` and `WebSocket.OPEN`: the only state a frame can be sent in. */
const SOCKET_CONNECTING = 0;
const SOCKET_OPEN = 1;

/** The same ask is sent again after this many steps (ten times a second), so the server's count of steps played with it is lined up with ours again. A tunable. */
const HEARTBEAT_STEPS = 6;

/** How many steps of what was asked for are kept to play again on top of the server's word: one second. Past that the server's word is taken as it is. A tunable. */
const HISTORY_STEPS = 60;

/** How far behind the newest snapshot the other fighter is drawn, in seconds, so there are two snapshots to blend between. A tunable. */
const INTERPOLATION_DELAY_SECONDS = 0.1;

/** How many snapshots are kept to blend the other fighter between. */
const SNAPSHOTS_KEPT = 10;

const NO_OFFSET: Point = {x: 0, y: 0};

/**
 * This browser's end of an online match. The server plays the match and is always right; this makes it feel as the local game does:
 * - **Own fighter, predicted.** Each fixed step (`step`) the player's input is sent when it changes (plus a heartbeat) and played at once
 *   on the browser's own copy of the fighter, so walking does not wait for the server. Each snapshot says how far the server has played the
 *   inputs (`ack`); the inputs after that are played again on top of its word, and a small disagreement is eased out, a large one corrected at once.
 * - **Other fighter, interpolated.** Drawn about a tenth of a second behind the newest snapshot, blended between two, and only as the
 *   server told of them: a fighter it did not send is simply not in the world.
 * The loop asks for the world to show each frame (`worldToShow`).
 */
export class OnlineMatch {
  private arena: Arena | undefined;
  private latest: World | undefined;
  private ready: Readiness | undefined;
  private choosing: PreRoundFrame | undefined;
  private readonly snapshots = new SnapshotBuffer(SNAPSHOTS_KEPT);
  private readonly renderClock = new RenderClock(INTERPOLATION_DELAY_SECONDS);
  private history = new InputHistory(HISTORY_STEPS);
  private predicted: Player | undefined;
  private offset: Point = NO_OFFSET;
  private lastSent: Input | undefined;
  private lastSentStep = 0;
  private clockSeconds = 0;
  private seated = false;
  private seatedOnThisConnection = false;

  /** `seatTokens` keeps the token the server gives this browser's seat, when there is somewhere to keep it, so a reload gets the seat back. */
  constructor(
    private readonly socket: MatchSocket,
    private readonly seatTokens?: SeatTokenKeeper,
  ) {
    socket.addEventListener("message", event => {
      this.receive(event.data);
    });
  }

  /** Plays one fixed step of this browser's clock: `input` is what the player asks for during it. */
  step(input: Input): void {
    if (this.socket.readyState !== SOCKET_OPEN) {
      this.seatedOnThisConnection = false;
    }

    const step = this.history.nextStep;
    this.history.record(step, input);
    this.send(step, input);
    this.predict(input);
    this.clockSeconds += TICK_SECONDS;
  }

  /**
   * The world to draw: the newest snapshot's, with this player where the browser has them and the other fighter where the blend puts
   * them. `leftoverSeconds` is how far the frame is into the step after the last played. `undefined` until the first snapshot comes.
   */
  worldToShow(leftoverSeconds: number): World | undefined {
    const latest = this.latest;
    const newest = this.snapshots.newest;
    if (!latest || !newest) {
      return undefined;
    }

    const shownAt = this.renderClock.at({
      now: this.clockSeconds + leftoverSeconds,
      newestElapsedSeconds: newest.elapsedSeconds,
    });

    return {...latest, player: this.shownPlayer(latest.player), opponent: opponentAt(this.snapshots.all, shownAt)};
  }

  /** Asks the server to go on, to the next round or, once the match is decided, to a fresh one. It begins when both players have asked. */
  readyForNextRound(): void {
    if (this.socket.readyState !== SOCKET_OPEN) {
      return;
    }

    this.socket.send(JSON.stringify({kind: "ready"}));
  }

  /** What the server last said of the two seats choosing their arena before the match, from this seat's side; `undefined` before it says anything and once the match has begun. */
  preRound(): PreRoundFrame | undefined {
    return this.choosing;
  }

  /** Puts the built-in arena named `name` forward. It is not final until `lockInArena`, and the server ignores a name it does not know. */
  chooseArena(name: string): void {
    this.sendWhenOpen({kind: "choose", step: "arena", choice: {kind: "builtIn", name}});
  }

  /** Locks in the arena put forward (the duel arena if none was): the other player's is then shown. */
  lockInArena(): void {
    this.sendWhenOpen({kind: "lockIn", step: "arena"});
  }

  /** Puts two built-in weapons forward by their keys (slot 1, slot 2). They are not final until `lockInWeapons`, and the server ignores a key it does not know. */
  chooseWeapons(keys: WeaponKeys): void {
    this.sendWhenOpen({
      kind: "choose",
      step: "weapons",
      choice: keys.map(key => ({kind: "builtIn", key})),
    });
  }

  /** Locks in the weapons put forward (the rifle and the marksman rifle if none): the other player's are then shown. */
  lockInWeapons(): void {
    this.sendWhenOpen({kind: "lockIn", step: "weapons"});
  }

  /** Votes, when both arenas are shown and differ, for one of them, for random, or for nothing. */
  pickArena(pick: SeatPick): void {
    this.sendWhenOpen({kind: "pickArena", pick});
  }

  /** Whether this player has asked to go on and the server is waiting for the other player to ask too. */
  isWaitingForTheOtherPlayer(): boolean {
    return this.ready?.player === true;
  }

  /** Whether the connection to the server is lost and being made again, after the match had begun: the player is told, and nothing is sent meanwhile. */
  isReconnecting(): boolean {
    return this.seated && this.socket.readyState === SOCKET_CONNECTING;
  }

  close(): void {
    this.socket.close();
  }

  /**
   * Sends `input` as `step` when it is the first, has changed, or is due again. Dropped while the socket is not open, and while the server
   * has not yet seated this browser on this connection (its `joined` frame): a connection made again after a loss is open before that, and
   * an input sent in the gap would carry a number from the count the server is about to be told has started again, which it would then
   * hold every later input to. The next step carries the ask.
   */
  private send(step: number, input: Input): void {
    const last = this.lastSent;
    if (last && !inputChanged(last, input) && step - this.lastSentStep < HEARTBEAT_STEPS) {
      return;
    }
    if (this.socket.readyState !== SOCKET_OPEN || !this.seatedOnThisConnection) {
      return;
    }

    this.socket.send(JSON.stringify({kind: "input", seq: step, ...input}));
    this.lastSent = input;
    this.lastSentStep = step;
  }

  /** Plays `input` on the predicted fighter, while the round is being fought, and fades the offset left by the last correction whatever the round. */
  private predict(input: Input): void {
    this.offset = fadedOffset(this.offset, TICK_SECONDS);

    const arena = this.arena;
    if (!arena || !this.predicted || this.latest?.round !== "playing") {
      return;
    }

    this.predicted = replayInputs({arena, player: this.predicted, inputs: [input]});
  }

  private shownPlayer(told: Player): Player {
    const predicted = this.predicted;
    if (!predicted) {
      return told;
    }

    const position = {x: predicted.position.x + this.offset.x, y: predicted.position.y + this.offset.y};

    return {...told, position, aim: predicted.aim, crouching: predicted.crouching};
  }

  private receive(data: unknown): void {
    if (typeof data !== "string") {
      return;
    }

    const message = parseServerMessage(data);
    if (message?.kind === "joined") {
      this.takeSeat(message);
    }
    if (message?.kind === "arena") {
      this.arena = arenaFrom(message.rows);
    }
    if (message?.kind === "preRound") {
      this.choosing = message;
    }
    if (message?.kind === "snapshot" && this.arena) {
      this.choosing = undefined;
      this.takeSnapshot(this.arena, message);
    }
  }

  /** Sends `frame` if the socket is open; a choice made while it is not is lost, and the player makes it again once the page is back. */
  private sendWhenOpen(frame: object): void {
    if (this.socket.readyState !== SOCKET_OPEN) {
      return;
    }

    this.socket.send(JSON.stringify(frame));
  }

  /**
   * The server has seated this browser, as it does on every connection, the first and each one after the connection was lost or the page
   * reloaded. It knows nothing of what this connection has asked for, and counts the inputs it plays from nothing again: so the count
   * begins again here, and the ask in force is sent again at the next step instead of waiting for it to change. The token it gives is
   * kept to get the seat back with.
   */
  private takeSeat(message: JoinedFrame): void {
    this.arena = arenaFrom(message.arena);
    this.seated = true;
    this.seatedOnThisConnection = true;
    this.history = new InputHistory(HISTORY_STEPS);
    this.lastSent = undefined;
    this.lastSentStep = 0;
    if (message.token) {
      this.seatTokens?.save(message.token);
    }
  }

  private takeSnapshot(arena: Arena, message: SnapshotFrame): void {
    this.latest = worldOfSeatView(arena, message);
    this.ready = message.ready;
    this.snapshots.add({
      elapsedSeconds: message.elapsedSeconds,
      opponent: message.opponent,
    });
    this.reconcile(arena, message);
  }

  /**
   * Puts the prediction on the server's word: the server's fighter, with the inputs it has not played yet played again. The player is
   * still drawn where they were if that is near, the difference then fading step by step (`offset`).
   */
  private reconcile(arena: Arena, message: SnapshotFrame): void {
    const target = this.replayedPlayer(arena, message);
    const shown = this.shownPosition();

    this.offset = NO_OFFSET;
    if (shown) {
      this.offset = correctionOffset({shown, target: target.position});
    }
    this.predicted = target;
  }

  /**
   * The server's fighter with the inputs it has not reached played again: all of them while it has not yet said it has any (no `ack`).
   * As it is when the round is not being fought, or when those inputs are older than the history reaches.
   */
  private replayedPlayer(arena: Arena, message: SnapshotFrame): Player {
    if (message.round !== "playing") {
      return message.player;
    }

    const inputs = this.history.from(this.stepsReached(message.ack));
    if (!inputs) {
      return message.player;
    }

    return replayInputs({arena, player: message.player, inputs});
  }

  /** Where the player is drawn: the prediction and the offset still to fade. `undefined` before there is a prediction. */
  private shownPosition(): Point | undefined {
    if (!this.predicted) {
      return undefined;
    }

    return {x: this.predicted.position.x + this.offset.x, y: this.predicted.position.y + this.offset.y};
  }

  /** The step of this browser's own count that the server has played its inputs up to: the input it has, plus the steps played with it. Zero before it has one. */
  private stepsReached(ack: InputAck | undefined): number {
    if (!ack) {
      return 0;
    }

    return ack.seq + ack.held;
  }
}
