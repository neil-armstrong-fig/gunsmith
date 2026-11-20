import {resolveArenaPicks} from "@gunsmith/engine/arena-picking/ResolveArenaPicks";
import type {ArenaPick} from "@gunsmith/engine/arena-picking/types/ArenaPick";
import {BUILT_IN_ARENAS} from "@gunsmith/engine/built-in-arenas/BuiltInArenas";
import {DUEL_BUILT_IN_ARENA} from "@gunsmith/engine/built-in-arenas/DuelBuiltInArena";
import type {BuiltInArena} from "@gunsmith/engine/built-in-arenas/types/BuiltInArena";
import type {Seat} from "@gunsmith/engine/seat/types/Seat";
import type {OpponentPreRound} from "@src/durable-objects/match/pre-round/types/OpponentPreRound";
import type {PreRoundMessage} from "@src/durable-objects/match/pre-round/types/PreRoundMessage";
import type {PreRoundOutcome} from "@src/durable-objects/match/pre-round/types/PreRoundOutcome";
import type {PreRoundSeat} from "@src/durable-objects/match/pre-round/types/PreRoundSeat";
import type {PreRoundStage} from "@src/durable-objects/match/pre-round/types/PreRoundStage";
import type {SeatPick} from "@src/durable-objects/match/pre-round/types/SeatPick";
import type {SeedMaker} from "@src/durable-objects/match/room/types/SeedMaker";

const SEATS: readonly Seat[] = ["first", "second"];

const OTHER_SEAT: Record<Seat, Seat> = {first: "second", second: "first"};

/**
 * What two players choose before a match, as plain state with no network in it (`MatchRoom` owns one and `Match` sends what it says).
 * Each seat puts forward a built-in arena and locks it in (a seat that never chooses puts forward the duel arena). A seat may do all of
 * that on its own, with no limit of time: the clock (`secondsAllowed`) only begins when `startClock` says both seats have sat. Once both
 * are locked in, a seat sees the other's arena. If the two are the same arena that is the arena; if they differ each seat picks one of
 * them, random, or nothing, and the engine's `resolveArenaPicks` settles it from a seed. When the clock runs out a seat that has not
 * locked in gets the duel arena and one that has not picked picks nothing, so the room never waits on a person. A seat's view holds only
 * what it may know: the other's arena is absent until both are locked in, and no prompt is ever here.
 */
export class PreRound {
  private readonly seats: Record<Seat, PreRoundSeat> = {first: {locked: false}, second: {locked: false}};
  private secondsLeft: number;
  private clockRunning = false;
  private decided: PreRoundOutcome | undefined;

  constructor(
    secondsAllowed: number,
    private readonly makeSeed: SeedMaker,
  ) {
    this.secondsLeft = secondsAllowed;
  }

  /** `seat` puts `name` forward, if it is a built-in arena and the seat has not locked in. Anything else is ignored. */
  chooseArena(seat: Seat, name: string): void {
    if (this.stage() !== "choosing" || this.seats[seat].locked) {
      return;
    }
    if (!builtInArenaNamed(name)) {
      return;
    }

    this.seats[seat].arena = name;
  }

  /** `seat` locks in the arena it has chosen (the duel arena if it chose none). It cannot change it afterwards. */
  lockIn(seat: Seat): void {
    if (this.stage() !== "choosing" || this.seats[seat].locked) {
      return;
    }

    this.seats[seat].arena ??= DUEL_BUILT_IN_ARENA.name;
    this.seats[seat].locked = true;
    this.settle();
  }

  /** `seat` picks, once, when both arenas are shown and differ. A pick at any other time, or a second one, is ignored. */
  pickArena(seat: Seat, pick: SeatPick): void {
    if (this.stage() !== "picking" || this.seats[seat].pick) {
      return;
    }

    this.seats[seat].pick = pick;
    this.settle();
  }

  /** `seat` has left on its own before the other sat: whatever it chose is forgotten, so whoever sits there next starts clean. */
  release(seat: Seat): void {
    this.seats[seat] = {locked: false};
  }

  /** Both seats have sat: the time allowed begins to run. With none allowed the pre-round is decided on the defaults at once. */
  startClock(): void {
    this.clockRunning = true;
    this.expireIfOutOfTime();
  }

  /** Lets `seconds` of game time pass. Nothing runs until `startClock`, so a seat on its own has no limit. */
  tick(seconds: number): void {
    if (!this.clockRunning || this.decided) {
      return;
    }

    this.secondsLeft = Math.max(0, this.secondsLeft - seconds);
    this.expireIfOutOfTime();
  }

  /** The arena the match is played in and how it was settled, or `undefined` while the seats are still choosing. */
  outcome(): PreRoundOutcome | undefined {
    return this.decided;
  }

  /** What `seat` may be told right now. */
  viewOf(seat: Seat): PreRoundMessage {
    const message: PreRoundMessage = {
      kind: "preRound",
      stage: this.stage(),
      own: {...this.seats[seat]},
      opponent: this.opponentOf(seat),
    };
    if (this.clockRunning) {
      message.secondsLeft = Math.ceil(this.secondsLeft);
    }
    if (this.decided) {
      message.how = this.decided.how;
    }

    return message;
  }

  private stage(): PreRoundStage {
    if (this.decided) {
      return "decided";
    }
    if (this.seats.first.locked && this.seats.second.locked) {
      return "picking";
    }

    return "choosing";
  }

  /** What `seat` may see of the other seat: flags always, their arena only once both are locked in. */
  private opponentOf(seat: Seat): OpponentPreRound {
    const other = this.seats[OTHER_SEAT[seat]];
    const opponent: OpponentPreRound = {locked: other.locked, picked: other.pick !== undefined};
    if (this.seats.first.locked && this.seats.second.locked && other.arena) {
      opponent.arena = other.arena;
    }

    return opponent;
  }

  /** Decides if the seats' locks and picks say enough: one arena between them, or both have picked. */
  private settle(): void {
    if (this.stage() !== "picking") {
      return;
    }

    const first = this.seats.first.arena;
    if (first === this.seats.second.arena) {
      this.decided = {arena: builtInArenaNamed(first) ?? DUEL_BUILT_IN_ARENA, how: "same"};

      return;
    }
    if (this.seats.first.pick && this.seats.second.pick) {
      this.decided = this.resolved();
    }
  }

  private expireIfOutOfTime(): void {
    if (this.secondsLeft > 0 || this.decided) {
      return;
    }

    for (const seat of SEATS) {
      if (!this.seats[seat].locked) {
        delete this.seats[seat].arena;
      }
      this.lockIn(seat);
    }
    for (const seat of SEATS) {
      this.pickArena(seat, {kind: "nothing"});
    }
  }

  /** The engine's rule over the two picks, drawing from a seed made now. Both seats have picked when this is called. */
  private resolved(): PreRoundOutcome {
    const picks = SEATS.map(seat => arenaPickOf(seat, this.seats[seat].pick));
    const resolution = resolveArenaPicks({picks, seed: this.makeSeed()});
    const chosen = SEATS.find(seat => seat === resolution.chosenPlayerId) ?? "first";

    return {arena: builtInArenaNamed(this.seats[chosen].arena) ?? DUEL_BUILT_IN_ARENA, how: resolution.how};
  }
}

function arenaPickOf(seat: Seat, pick: SeatPick | undefined): ArenaPick {
  if (pick?.kind === "arena") {
    return {playerId: seat, choice: {kind: "arena", chosenPlayerId: pick.seat}};
  }
  if (pick?.kind === "random") {
    return {playerId: seat, choice: {kind: "random"}};
  }

  return {playerId: seat, choice: {kind: "nothing"}};
}

function builtInArenaNamed(name: string | undefined): BuiltInArena | undefined {
  return BUILT_IN_ARENAS.find(arena => arena.name === name);
}
