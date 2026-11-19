import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import {DUEL_BUILT_IN_ARENA} from "@gunsmith/engine/built-in-arenas/DuelBuiltInArena";
import {startingWorld} from "@gunsmith/engine/game-loop/StartingWorld";
import {stepFighters} from "@gunsmith/engine/game-loop/StepFighters";
import type {FighterInputs} from "@gunsmith/engine/game-loop/types/FighterInputs";
import type {Input} from "@gunsmith/engine/game-loop/types/Input";
import type {World} from "@gunsmith/engine/game-loop/types/World";
import {decideMatch} from "@gunsmith/engine/match/DecideMatch";
import {forfeitRound} from "@gunsmith/engine/match/ForfeitRound";
import {nextRound} from "@gunsmith/engine/match/NextRound";
import {startMatch} from "@gunsmith/engine/match/StartMatch";
import type {Match} from "@gunsmith/engine/match/types/Match";
import type {Seat} from "@gunsmith/engine/seat/types/Seat";
import {viewOfSeat} from "@gunsmith/engine/seat/ViewOfSeat";
import type {InputAck} from "@gunsmith/shared/online/types/InputAck";
import {DEFAULT_FORFEIT_LIMITS} from "@src/durable-objects/match/room/DefaultForfeitLimits";
import {askChanged} from "@src/durable-objects/match/room/forfeit/AskChanged";
import type {ForfeitLimits} from "@src/durable-objects/match/room/types/ForfeitLimits";
import type {JoinedMessage} from "@src/durable-objects/match/room/types/JoinedMessage";
import type {Readiness} from "@src/durable-objects/match/room/types/Readiness";
import type {SnapshotMessage} from "@src/durable-objects/match/room/types/SnapshotMessage";
import {MATCH_TICK} from "@src/durable-objects/match/tick/MatchTick";

const SECOND_FIGHTER_STARTS_AT = {x: 16.5, y: 6.5};

const NOTHING_ASKED: Input = {direction: {x: 0, y: 0}, firing: false, reload: false};

const OTHER_SEAT: Record<Seat, Seat> = {first: "second", second: "first"};

const SEATS: readonly Seat[] = ["first", "second"];

/**
 * One private room's match, as plain state with no network in it: who has taken which seat, what each seat last asked for, and
 * the engine's world, which only this class steps. The Durable Object (`match/Match.ts`) feeds it frames and a clock and sends
 * what it answers. The match (a best of three) begins when the second seat is taken; before that no world exists and nothing is sent.
 * A decided round waits, frozen, until both seats have asked to go on (`ready`), then the next round begins; once the match itself is
 * decided, both asking begins a fresh match.
 *
 * The room does not wait for ever (`docs/match-netcode.md`, "Reconnect and forfeits"). Each seat has a clock of how long it has been
 * silent, counted in the game time `tick` plays: it starts again when the person leaves or comes back, asks for something new
 * (`askChanged`) or asks to go on, and when a round is decided or begins. A seat whose person is away is silent for `reconnectSeconds`
 * at most; one whose person is there, for `idleSeconds`. Then it forfeits: the round being fought goes to the other seat, and a decided
 * round that was waiting for it to ask to go on has the next round forfeited as it begins. If both seats run out together nobody forfeits
 * (two people gone is a stall, not a win for either), and a decided match forfeits nothing.
 */
export class MatchRoom {
  private readonly arena: Arena = arenaFrom(DUEL_BUILT_IN_ARENA.rows);
  private readonly seated: Seat[] = [];
  private readonly tokens: Record<Seat, string> = {first: "", second: ""};
  private readonly asked: Record<Seat, Input> = {first: NOTHING_ASKED, second: NOTHING_ASKED};
  private readonly acked: Partial<Record<Seat, InputAck>> = {};
  private readonly pulled: Record<Seat, boolean> = {first: false, second: false};
  private readonly readied: Record<Seat, boolean> = {first: false, second: false};
  private readonly present: Record<Seat, boolean> = {first: true, second: true};
  private readonly silentSeconds: Record<Seat, number> = {first: 0, second: 0};
  private world: World | undefined;

  /**
   * `limits` is how long the room waits for a person (the real ones unless a page asked for shorter). `makeToken` makes the secret each
   * seat is given as it sits down: whoever shows it later is that seat's person.
   */
  constructor(
    private readonly limits: ForfeitLimits = DEFAULT_FORFEIT_LIMITS,
    private readonly makeToken: () => string = () => crypto.randomUUID(),
  ) {}

  /** The next free seat, or `undefined` when both are taken. The second to sit starts the match. */
  join(): Seat | undefined {
    const seat = this.nextFreeSeat();
    if (!seat) {
      return undefined;
    }

    this.seated.push(seat);
    this.tokens[seat] = this.makeToken();
    this.present[seat] = true;
    this.silentSeconds[seat] = 0;
    if (seat === "second") {
      this.world = this.worldOfRound(startMatch());
    }

    return seat;
  }

  /**
   * Notes that `seat`'s person is gone. Before the match begins the seat is given back: a browser that connects and goes (a page
   * reloading) must not keep the room full, and its token is void. Once it has begun the seat is kept for its person, who may come back
   * with its token (`reconnect`) and is not replaced by a stranger. Meanwhile the fighter stands still where it is, in the match and still
   * hittable, as `docs/match-netcode.md` says, until the reconnect window runs out and the round is forfeited.
   */
  leave(seat: Seat): void {
    if (this.world) {
      this.asked[seat] = NOTHING_ASKED;
      this.pulled[seat] = false;
      this.present[seat] = false;
      this.silentSeconds[seat] = 0;

      return;
    }

    const index = this.seated.indexOf(seat);
    if (index >= 0) {
      this.seated.splice(index, 1);
      this.tokens[seat] = "";
    }
  }

  /**
   * The seat whose person shows `token`, taken back as they left it, or `undefined` for a token that is not a seat's (or before the match
   * begins, when a seat that left is simply free). A returning page counts its inputs from nothing again, so what the seat had reached
   * is forgotten and its next input is played whatever its number; its ask to go on is kept. It works while the seat is still held too,
   * for a page that comes back before the old connection is known to be gone.
   */
  reconnect(token: string): Seat | undefined {
    const seat = this.seatOfToken(token);
    if (!seat || !this.world) {
      return undefined;
    }

    delete this.acked[seat];
    this.asked[seat] = NOTHING_ASKED;
    this.pulled[seat] = false;
    this.present[seat] = true;
    this.silentSeconds[seat] = 0;

    return seat;
  }

  /** The word a browser is sent as it sits down, with the secret that gets the seat back for it. */
  joinedMessage(seat: Seat): JoinedMessage {
    return {kind: "joined", seat, arena: DUEL_BUILT_IN_ARENA.rows, token: this.tokens[seat]};
  }

  /**
   * Remembers what `seat` last asked for, under the number the browser gave it (`seq`). It is played at the next tick. A reload, a weapon
   * switch or a trigger pull is asked once and is not lost to a later input that arrives before the tick (a click pressed and released
   * between two ticks is two inputs, and only the last would otherwise be played): it stays until played. An input older than one already
   * received is dropped. The seat is told which input it has reached in each snapshot (`ack`).
   */
  setInput(seat: Seat, input: Input, seq: number): void {
    const before = this.asked[seat];
    const reached = this.acked[seat];
    if (reached && seq < reached.seq) {
      return;
    }

    if (askChanged(before, input)) {
      this.silentSeconds[seat] = 0;
    }
    this.acked[seat] = {seq, held: 0};
    this.pulled[seat] = this.pulled[seat] || input.firing;
    this.asked[seat] = {...input, reload: input.reload || before.reload, switchTo: input.switchTo ?? before.switchTo};
  }

  /**
   * Notes that `seat` asks to go on, to the next round or, once the match is decided, to a fresh match. It counts only once the round is
   * decided, so a seat cannot ask ahead; when both have asked the next round begins at once, with the score kept and both fighters
   * restored, and what either seat had asked for during the pause is forgotten.
   */
  ready(seat: Seat): void {
    const world = this.world;
    if (!world || world.round === "playing") {
      return;
    }

    this.readied[seat] = true;
    this.silentSeconds[seat] = 0;
    if (this.readied.first && this.readied.second) {
      this.begin(world.match ?? startMatch());
    }
  }

  /**
   * Plays `steps` engine steps (one by default) from what each seat asked for: the clock says how many it owes, since a timer
   * fires late and unevenly. Nothing happens before the match begins or when no step is owed (so a one-shot ask waits for a step that
   * plays it). A reload, weapon switch or trigger pull is played in the first step only.
   */
  tick(steps = 1): void {
    if (!this.world || steps <= 0) {
      return;
    }

    const wasBeingFought = this.world.round === "playing";
    let world = this.world;
    for (let step = 0; step < steps; step += 1) {
      world = stepFighters(world, this.inputsOfStep(step), MATCH_TICK.stepSeconds);
    }
    this.world = world;
    this.asked.first = withoutOneShots(this.asked.first);
    this.asked.second = withoutOneShots(this.asked.second);
    this.pulled.first = false;
    this.pulled.second = false;
    this.countSteps(steps);

    if (wasBeingFought && world.round !== "playing") {
      this.restartClocks();

      return;
    }

    // One step at a time, so that of two seats running out in one stretch of steps the first to do so is the one that forfeits.
    for (let step = 0; step < steps; step += 1) {
      this.watchClocks(MATCH_TICK.stepSeconds);
    }
  }

  /** What `seat` may be told right now: only what the engine says it sees, and how far its inputs have been played. `undefined` before the match begins. */
  snapshotFor(seat: Seat): SnapshotMessage | undefined {
    if (!this.world) {
      return undefined;
    }

    return {kind: "snapshot", ...viewOfSeat(this.world, seat), ack: this.acked[seat], ready: this.readinessOf(seat)};
  }

  /** The round after the one `match` has just ended, or a fresh match when `match` is decided. */
  private begin(match: Match): void {
    this.startRound(this.worldOfRound(decideMatch(match) === "playing" ? nextRound(match) : startMatch()));
  }

  /** Makes `world` the one being played: nobody has asked to go on, nothing is held over from the last round, and every clock begins again. */
  private startRound(world: World): void {
    this.world = world;
    this.readied.first = false;
    this.readied.second = false;
    this.asked.first = NOTHING_ASKED;
    this.asked.second = NOTHING_ASKED;
    this.pulled.first = false;
    this.pulled.second = false;
    this.restartClocks();
  }

  /** Lets `seconds` of game time pass on each seat's clock, and forfeits for the one seat that has been silent too long. */
  private watchClocks(seconds: number): void {
    for (const seat of SEATS) {
      this.silentSeconds[seat] += seconds;
    }

    const silentTooLong = SEATS.filter(seat => this.silentSeconds[seat] >= this.limitOf(seat));
    const seat = silentTooLong[0];
    if (!seat) {
      return;
    }
    if (silentTooLong.length > 1) {
      this.restartClocks();

      return;
    }

    this.forfeit(seat);
  }

  /** How long `seat` may be silent: the reconnect window if its person is away, the idle time if they are there. */
  private limitOf(seat: Seat): number {
    if (this.present[seat]) {
      return this.limits.idleSeconds;
    }

    return this.limits.reconnectSeconds;
  }

  /**
   * `seat` has been silent too long. The round being fought goes to the other seat. A decided round, which was waiting for them to ask to go
   * on, has the next round forfeited as it begins (the other seat is shown the result and asks to go on as usual). A decided match has
   * nothing left to forfeit, so the seat's clock only starts again.
   */
  private forfeit(seat: Seat): void {
    const world = this.world;
    if (!world) {
      return;
    }

    if (world.round === "playing") {
      this.world = forfeitRound(world, seat);
      this.restartClocks();

      return;
    }

    const match = world.match;
    if (!match || decideMatch(match) !== "playing") {
      this.silentSeconds[seat] = 0;

      return;
    }

    this.startRound(forfeitRound(this.worldOfRound(nextRound(match)), seat));
  }

  private restartClocks(): void {
    this.silentSeconds.first = 0;
    this.silentSeconds.second = 0;
  }

  /** A round about to be fought: both fighters at their starting places with full health and magazines, in `match`. */
  private worldOfRound(match: Match): World {
    return {...startingWorld(this.arena, [], SECOND_FIGHTER_STARTS_AT), match};
  }

  private readinessOf(seat: Seat): Readiness {
    return {player: this.readied[seat], opponent: this.readied[OTHER_SEAT[seat]]};
  }

  private countSteps(steps: number): void {
    for (const seat of this.seated) {
      const reached = this.acked[seat];
      if (reached) {
        this.acked[seat] = {...reached, held: reached.held + steps};
      }
    }
  }

  private seatOfToken(token: string): Seat | undefined {
    if (token === "") {
      return undefined;
    }
    if (token === this.tokens.first) {
      return "first";
    }
    if (token === this.tokens.second) {
      return "second";
    }

    return undefined;
  }

  private nextFreeSeat(): Seat | undefined {
    if (this.seated.length === 0) {
      return "first";
    }
    if (this.seated.length === 1) {
      return "second";
    }

    return undefined;
  }

  /** A reload, a weapon switch or a trigger pull is asked once: only the tick's first step plays it. */
  private inputsOfStep(step: number): FighterInputs {
    if (step === 0) {
      return {first: this.withPulls("first"), second: this.withPulls("second")};
    }

    return {first: withoutOneShots(this.asked.first), second: withoutOneShots(this.asked.second)};
  }

  /** What `seat` asked for, with the trigger down if it was pulled at any time since the last tick, even if let go again. */
  private withPulls(seat: Seat): Input {
    return {...this.asked[seat], firing: this.asked[seat].firing || this.pulled[seat]};
  }
}

function withoutOneShots(input: Input): Input {
  return {...input, reload: false, switchTo: undefined};
}
